import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { generateUploadUrl } from '../storage';
import { db } from '../db';

// Upload router for file uploads
export const uploadRouter = router({
  // Get presigned URL for file upload
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        fileType: z.enum(['AUDIO', 'ARTWORK']),
        fileName: z.string(),
        releaseId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileType, fileName, releaseId } = input;
      const userId = ctx.user.id;

      try {
        // Check if release exists and belongs to user
        const release = await db.release.findUnique({
          where: { id: releaseId },
        });

        if (!release) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Release not found',
          });
        }

        if (release.userId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this release',
          });
        }

        // Generate upload URL using Supabase Storage
        const { uploadUrl, filePath } = await generateUploadUrl(
          fileName,
          fileType,
          releaseId
        );

        // Create file upload record
        const fileUpload = await db.fileUpload.create({
          data: {
            fileType,
            url: filePath,
            releaseId,
          },
        });

        // Update release with artwork URL if file type is ARTWORK
        if (fileType === 'ARTWORK') {
          await db.release.update({
            where: { id: releaseId },
            data: { artworkUrl: filePath },
          });
        }

        return {
          uploadUrl,
          fileUrl: filePath,
          fileUploadId: fileUpload.id,
        };
      } catch (error) {
        console.error('Error generating upload URL:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        });
      }
    }),

  // Update track with audio URL
  updateTrackAudio: protectedProcedure
    .input(
      z.object({
        trackId: z.string(),
        audioUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { trackId, audioUrl } = input;
      const userId = ctx.user.id;

      try {
        // Get track
        const track = await db.track.findUnique({
          where: { id: trackId },
          include: {
            release: true,
          },
        });

        if (!track) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Track not found',
          });
        }

        // Check if user has access to this track's release
        if (track.release.userId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this track',
          });
        }

        // Update track with audio URL
        const updatedTrack = await db.track.update({
          where: { id: trackId },
          data: { audioUrl },
        });

        return updatedTrack;
      } catch (error) {
        console.error('Error updating track audio:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update track audio',
        });
      }
    }),
});