import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, adminProcedure } from '../trpc';
import { generateDownloadUrl } from '../storage';
import { db } from '../db';

// Admin router with approval and download functionality
export const adminRouter = router({
  // Approve a release
  approveRelease: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // Update release status
      const release = await db.release.update({
        where: { id },
        data: {
          status: 'APPROVED',
        },
        include: {
          tracks: true,
        },
      });

      return release;
    }),

  // Reject a release
  rejectRelease: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // Update release status
      const release = await db.release.update({
        where: { id },
        data: {
          status: 'REJECTED',
        },
        include: {
          tracks: true,
        },
      });

      return release;
    }),

  // Distribute a release
  distributeRelease: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // Update release status
      const release = await db.release.update({
        where: { id },
        data: {
          status: 'DISTRIBUTED',
        },
        include: {
          tracks: true,
        },
      });

      return release;
    }),

  // Get download URLs for all files in a release
  getDownloadUrls: adminProcedure
    .input(z.object({ releaseId: z.string() }))
    .query(async ({ input }) => {
      const { releaseId } = input;

      try {
        // Get release with tracks
        const release = await db.release.findUnique({
          where: { id: releaseId },
          include: {
            tracks: true,
          },
        });

        if (!release) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Release not found',
          });
        }

        // Generate download URLs for artwork and tracks
        const downloadUrls = [];

        // Add artwork URL if exists
        if (release.artworkUrl) {
          const artworkUrl = await generateDownloadUrl(release.artworkUrl);
          downloadUrls.push({
            type: 'ARTWORK',
            name: `${release.title} - Artwork`,
            url: artworkUrl,
          });
        }

        // Add track URLs
        for (const track of release.tracks) {
          if (track.audioUrl) {
            const audioUrl = await generateDownloadUrl(track.audioUrl);
            downloadUrls.push({
              type: 'AUDIO',
              name: track.title,
              url: audioUrl,
            });
          }
        }

        return downloadUrls;
      } catch (error) {
        console.error('Error generating download URLs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URLs',
        });
      }
    }),

  // Get metadata as JSON for a release
  getMetadataJson: adminProcedure
    .input(z.object({ releaseId: z.string() }))
    .query(async ({ input }) => {
      const { releaseId } = input;

      try {
        // Get release with tracks and user
        const release = await db.release.findUnique({
          where: { id: releaseId },
          include: {
            tracks: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        });

        if (!release) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Release not found',
          });
        }

        // Format metadata
        const metadata = {
          release: {
            id: release.id,
            title: release.title,
            status: release.status,
            artworkUrl: release.artworkUrl,
            createdAt: release.createdAt,
            updatedAt: release.updatedAt,
          },
          artist: {
            id: release.user.id,
            name: release.user.name,
            email: release.user.email,
            role: release.user.role,
          },
          tracks: release.tracks.map((track) => ({
            id: track.id,
            title: track.title,
            duration: track.duration,
            genre: track.genre,
            language: track.language,
            isrc: track.isrc,
          })),
        };

        return metadata;
      } catch (error) {
        console.error('Error generating metadata JSON:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate metadata JSON',
        });
      }
    }),

  // Get metadata as CSV for a release
  getMetadataCsv: adminProcedure
    .input(z.object({ releaseId: z.string() }))
    .query(async ({ input }) => {
      const { releaseId } = input;

      try {
        // Get release with tracks and user
        const release = await db.release.findUnique({
          where: { id: releaseId },
          include: {
            tracks: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!release) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Release not found',
          });
        }

        // Create CSV header
        let csv = 'Track Title,Artist,Duration,Genre,Language,ISRC\n';

        // Add tracks to CSV
        for (const track of release.tracks) {
          const duration = track.duration 
            ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
            : '';
          
          csv += `"${track.title}","${release.user.name}","${duration}","${track.genre || ''}","${track.language || ''}","${track.isrc || ''}"\n`;
        }

        return csv;
      } catch (error) {
        console.error('Error generating metadata CSV:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate metadata CSV',
        });
      }
    }),
});