/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appointmentRequests from "../appointmentRequests.js";
import type * as appointments from "../appointments.js";
import type * as linkRequests from "../linkRequests.js";
import type * as notificationTemplates from "../notificationTemplates.js";
import type * as seed from "../seed.js";
import type * as serviceHistory from "../serviceHistory.js";
import type * as services from "../services.js";
import type * as timeBlocks from "../timeBlocks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appointmentRequests: typeof appointmentRequests;
  appointments: typeof appointments;
  linkRequests: typeof linkRequests;
  notificationTemplates: typeof notificationTemplates;
  seed: typeof seed;
  serviceHistory: typeof serviceHistory;
  services: typeof services;
  timeBlocks: typeof timeBlocks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
