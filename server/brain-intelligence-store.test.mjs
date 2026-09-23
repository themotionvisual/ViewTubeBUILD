import assert from "node:assert/strict";
import test from "node:test";
import {
  listPersistedBrainEvents,
  listPersistedLifecycleObservations,
  upsertPersistedBrainEvents,
  upsertPersistedLifecycleObservations,
} from "./brain-intelligence-store.mjs";

test("Brain intelligence events remain user and channel scoped", async () => {
  const userA = "test-user-a";
  const userB = "test-user-b";
  const channelA = "channel-a";
  const channelB = "channel-b";

  await upsertPersistedBrainEvents({
    userId: userA,
    channelId: channelA,
    events: [
      { id: "event-a", channelId: channelA, createdAt: 100 },
      { id: "wrong-channel", channelId: channelB, createdAt: 200 },
    ],
  });
  await upsertPersistedBrainEvents({
    userId: userB,
    channelId: channelA,
    events: [{ id: "event-b", channelId: channelA, createdAt: 300 }],
  });

  const rowsA = await listPersistedBrainEvents({ userId: userA, channelId: channelA });
  const rowsB = await listPersistedBrainEvents({ userId: userB, channelId: channelA });
  const otherChannel = await listPersistedBrainEvents({ userId: userA, channelId: channelB });

  assert.deepEqual(rowsA.map((row) => row.id), ["event-a"]);
  assert.deepEqual(rowsB.map((row) => row.id), ["event-b"]);
  assert.deepEqual(otherChannel, []);
});

test("lifecycle observations remain user and channel scoped", async () => {
  const userId = "test-user-observations";
  const channelId = "channel-observations";

  await upsertPersistedLifecycleObservations({
    userId,
    channelId,
    observations: [
      { channelId, videoId: "video-1", metric: "views", value: 100, lifecycleHour: 24, observedAt: 1000 },
      { channelId: "other-channel", videoId: "video-2", metric: "views", value: 200, lifecycleHour: 24, observedAt: 1000 },
    ],
  });

  const rows = await listPersistedLifecycleObservations({ userId, channelId });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].videoId, "video-1");
  assert.equal(rows[0].metric, "views");
});
