import { db } from '../db';

/**
 * Audit Logger Service
 * Handles logging of agreement-related actions for compliance and tracking
 */

export interface AuditLogDetails {
  [key: string]: any;
}

export type ActorRole = 'user' | 'admin';

/**
 * Log the creation of a new agreement request
 * @param agreementRequestId - UUID of the agreement request
 * @param userId - UUID of the user who created the request
 * @param details - Additional details about the creation (e.g., pdf_path, signed_name)
 */
export async function logAgreementCreation(
  agreementRequestId: string,
  userId: string,
  details: AuditLogDetails
): Promise<void> {
  await db.agreementAuditLog.create({
    data: {
      agreementRequestId,
      actorId: userId,
      actorRole: 'user' as ActorRole,
      action: 'created',
      details,
    },
  });
}

/**
 * Log a status change to an agreement request
 * @param agreementRequestId - UUID of the agreement request
 * @param actorId - UUID of the actor (admin) who changed the status
 * @param actorRole - Role of the actor ('user' or 'admin')
 * @param oldStatus - Previous status value
 * @param newStatus - New status value
 * @param additionalDetails - Optional additional details (e.g., notes, reason)
 */
export async function logStatusChange(
  agreementRequestId: string,
  actorId: string,
  actorRole: ActorRole,
  oldStatus: string,
  newStatus: string,
  additionalDetails?: AuditLogDetails
): Promise<void> {
  const details: AuditLogDetails = {
    oldStatus,
    newStatus,
    ...additionalDetails,
  };

  await db.agreementAuditLog.create({
    data: {
      agreementRequestId,
      actorId,
      actorRole,
      action: 'status_changed',
      details,
    },
  });
}
