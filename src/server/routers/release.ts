import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { generatePresignedGetUrl } from '../minio';
import { db } from '../db';

// Release router with CRUD operations
export const releaseRouter = router({
  // Create a new release
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        artworkUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, artworkUrl } = input;
      const userId = ctx.user.id;

      // Create release
      const release = await db.release.create({
        data: {
          title,
          artworkUrl,
          status: 'DRAFT',
          userId,
        },
      });

      return release;
    }),

  // Get all releases for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const isAdmin = ctx.user.role === 'ADMIN';

    // Get releases based on user role
    const releases = await db.release.findMany({
      where: isAdmin ? {} : { userId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return releases;
  }),

  // Get a single release by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.id;
      const isAdmin = ctx.user.role === 'ADMIN';

      // Get release
      const release = await db.release.findUnique({
        where: { id },
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

      // Check if user has access to this release
      if (!isAdmin && release.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this release',
        });
      }

      return release;
    }),

  // Update a release
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        artworkUrl: z.string().optional(),
        status: z.enum([
          'DRAFT',
          'UNDER_REVIEW',
          'APPROVED',
          'REJECTED',
          'DISTRIBUTED',
        ]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const userId = ctx.user.id;
      const isAdmin = ctx.user.role === 'ADMIN';

      // Get release
      const release = await db.release.findUnique({
        where: { id },
      });

      if (!release) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Release not found',
        });
      }

      // Check if user has access to this release
      if (!isAdmin && release.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this release',
        });
      }

      // Only admin can change status
      if (data.status && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin can change release status',
        });
      }

      // Update release
      const updatedRelease = await db.release.update({
        where: { id },
        data,
        include: {
          tracks: true,
        },
      });

      return updatedRelease;
    }),

  // Submit a release for review
  submitForReview: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.id;

      // Get release
      const release = await db.release.findUnique({
        where: { id },
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

      // Check if user has access to this release
      if (release.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this release',
        });
      }

      // Check if release has tracks
      if (release.tracks.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Release must have at least one track',
        });
      }

      // Update release status
      const updatedRelease = await db.release.update({
        where: { id },
        data: {
          status: 'UNDER_REVIEW',
        },
        include: {
          tracks: true,
        },
      });

      return updatedRelease;
    }),

  // Add a track to a release
  addTrack: protectedProcedure
    .input(
      z.object({
        releaseId: z.string(),
        title: z.string().min(1),
        duration: z.number().int().optional(),
        genre: z.string().optional(),
        language: z.string().optional(),
        isrc: z.string().optional(),
        audioUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { releaseId, ...trackData } = input;
      const userId = ctx.user.id;

      // Get release
      const release = await db.release.findUnique({
        where: { id: releaseId },
      });

      if (!release) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Release not found',
        });
      }

      // Check if user has access to this release
      if (release.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this release',
        });
      }

      // Check if release is in draft status
      if (release.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot add tracks to a release that is not in draft status',
        });
      }

      // Create track
      const track = await db.track.create({
        data: {
          ...trackData,
          releaseId,
        },
      });

      return track;
    }),

  // Update a track
  updateTrack: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        duration: z.number().int().optional(),
        genre: z.string().optional(),
        language: z.string().optional(),
        isrc: z.string().optional(),
        audioUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const userId = ctx.user.id;

      // Get track
      const track = await db.track.findUnique({
        where: { id },
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

      // Check if release is in draft status
      if (track.release.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update tracks for a release that is not in draft status',
        });
      }

      // Update track
      const updatedTrack = await db.track.update({
        where: { id },
        data,
      });

      return updatedTrack;
    }),

  // Delete a track
  deleteTrack: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.id;

      // Get track
      const track = await db.track.findUnique({
        where: { id },
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

      // Check if release is in draft status
      if (track.release.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete tracks from a release that is not in draft status',
        });
      }

      // Delete track
      await db.track.delete({
        where: { id },
      });

      return { success: true };
    }),
});