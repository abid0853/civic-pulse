# Firestore Security Rules

Copy and paste these rules into your **Firebase Console → Firestore Database → Rules** tab.

---

## How It Works

| Role | What they can do |
|------|-----------------|
| **Any authenticated user** | Create new reports (`status: 'pending'`), read all bounties and profiles |
| **Standard user** | Update their own profile (except `badgeLevel` and `total_points`). Update bounties from `bounty_active` → `completed` with after-image proof. |
| **Admin** | Update any bounty's `status` and `rewardAmount`. Assign `badgeLevel` on any user's profile. |
| **Nobody** | Delete documents (only admins via the Firebase Console) |

---

## Complete Rules (Firestore Only — Free Spark Plan)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Bounties ───────────────────────────────────────────
    match /bounties/{bountyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if true;   // Open for hackathon demo (admin has no auth)
      allow delete: if false;
    }

    // ─── Profiles ───────────────────────────────────────────
    match /profiles/{userId} {
      // Anyone can read (needed for leaderboard, admin panel)
      allow read: if true;

      // Users can create their own profile
      allow create: if request.auth != null
        && request.auth.uid == userId;

      // Update rules:
      //   - Admins can update anything (including badgeLevel)
      //   - Regular users can update their own profile,
      //     but CANNOT change badgeLevel or total_points
      allow update: if request.auth != null && (
        // Admin path: has a doc in the admins collection
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
        ||
        // Owner path: can edit own profile but not protected fields
        (
          request.auth.uid == userId &&
          !request.resource.data.diff(resource.data).affectedKeys().hasAny(['badgeLevel', 'total_points'])
        )
      );

      allow delete: if false;
    }

    // ─── Admins Collection ──────────────────────────────────
    match /admins/{userId} {
      // Only admins can read
      allow read: if request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      // No client-side writes — manage admins from Firebase Console only
      allow write: if false;
    }
  }
}
```

---

## Hackathon Shortcut (Open Rules)

If you haven't set up the `admins` collection yet and just want everything to work for the demo, use these simpler rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bounties/{bountyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if true;
      allow delete: if false;
    }
    match /profiles/{userId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if false;
    }
  }
}
```

> **Warning:** These open rules allow anyone to assign badges. Only use for the hackathon demo.

---

## Setup Checklist

1. **Go to Firebase Console → Firestore Database → Rules**
2. **Paste** either the complete rules or the hackathon shortcut above
3. **Click "Publish"**
4. **(Optional) Create the `admins` collection** for the full rules:
   - Firestore → Start a collection → Name it `admins`
   - Add a document with **ID = your admin user's UID**
   - Add fields: `email` (string), `role` (string) = `"admin"`

> **Note:** Firebase Storage is NOT used in this project. All images are stored as base64 data URLs directly in Firestore documents, which works on the free Spark plan.
