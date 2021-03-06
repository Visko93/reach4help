import * as firebase from '@firebase/testing';
import * as Test from 'firebase-functions-test';

import { triggerEventsWhenRequestIsDeleted } from '../../src/requests';

const projectId = 'reach-4-help-test';

const test = Test();

/**
 * Creates a new app with admin authentication.
 *
 * @return {object} the app.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminApp = () => {
  return firebase.initializeAdminApp({ projectId }).firestore();
};

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId });
});

afterAll(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

// must enter algolia_key, algolia_id, and algolia_requests_index into .env for test to pass
describe('request triggers', () => {
  const db = adminApp();
  it('should delete document from algolia index', async () => {
    const triggeredOnRequestDelete = test.wrap(triggerEventsWhenRequestIsDeleted);
    const ref = db.collection('requests').doc('request-1');
    await ref.set({
      displayName: 'sdd',
    });
    const snap = await ref.get();
    expect(await triggeredOnRequestDelete(snap)).toMatchObject(
      expect.objectContaining({
        taskID: expect.any(Number),
      }),
    );
  });
});
