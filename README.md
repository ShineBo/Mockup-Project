# Cloudspace — frontend mockup

A React + Vite mockup for a university Cloud Storage & File Sharing System project, based on the supplied handwritten UI and use case drawings.

## Run locally

```sh
npm install
npm run dev
```

Open the local address printed by Vite. To create a production build, run `npm run build`; `npm run preview` serves the build.

## Demonstration flows

- **My files:** browse folders, switch list/grid view, filter by type, search the current folder, and sort. Open an item's details for rename, move, download, sharing, or recoverable deletion.
- **Upload files:** browse or drop multiple files, edit their names, choose a destination, and upload. The demo accepts files up to 25 MB each and limits active workspace metadata to 1 GB.
- **Shared with me:** browse sample shared items. Read-only items cannot be renamed; read/write items can. Received items cannot be deleted from the owner's workspace.
- **Shared by me:** review items with assigned recipients. Sharing supports restricted or within-company access, read/read-write permissions, recipient removal, and generated demo links. Recipients must match active Employee accounts. External sharing is shown as unavailable in the current scope.
- **Trash:** restore items and folder contents or confirm permanent removal of demo items.
- **My account:** view personal information managed by the admin, simulate a password change, and sign out. Employees cannot edit or save profile details. The sign-in screen accepts sample credentials or a demo-account button.
- **Admin:** selecting Admin opens a separate management overview with account summaries, employee registration/editing, status and role filters, sharing metadata, and local activity records. Admin has no My files, Upload, or personal sharing navigation. Item records show names/sizes only, with no content preview or download. The current admin cannot deactivate or demote their own account.
- **Reset:** A little help? → Reset demo workspace restores the original sample data.

## Frontend boundaries

There is **no API, backend, database, real authentication, email delivery, cloud upload, or enforced security**. The role selector is a demonstration control. Generated `cloudspace.demo` links do not serve files. Do not use real credentials.

File metadata, employee records, profile information, sharing settings, and local activity records persist in browser localStorage. Passwords are never saved. Uploaded file contents are held in memory for the current session and disappear on refresh; upload them again to view or download originals. Sample documents download as explicitly named `.demo.txt` files. Text and image uploads can be previewed, and other formats can be downloaded for local viewing. Search applies to the current view/folder.

The first visit starts in My files so the project is immediately reviewable. The selected demo role is remembered; refreshing Admin view opens the Admin overview. Sign out from My account to demonstrate the login page. The UI adapts to mobile with a navigation drawer and scrollable data tables.

## Source files

- `src/App.jsx`: workspace state, navigation, and file-management screens
- `src/pages/AccountPage.jsx`: read-only profile details and password-change form
- `src/pages/AdminOverviewPage.jsx`: management summaries and shortcuts
- `src/pages/AdminSharingPage.jsx`: sharing metadata review
- `src/pages/AdminActivityPage.jsx`: searchable local activity records
- `src/admin.js`: admin navigation and record projections
- `src/components/`: reusable UI, sharing, employee, folder, and file-preview components
- `src/App.css`: responsive application styles
- `src/data.js`: sample workspace and employee data
- `src/icons.jsx`: inline SVG icon library
- `src/index.css`: global typography and base styles

Fonts use Google Fonts with local sans-serif fallbacks; all functionality works without the font request.

## Code formatting

Prettier uses two-space indentation, single quotes, and an 80-character line width.

```sh
npm run format
npm run format:check
```

Personal information can only be changed through **Admin → Employee accounts → Edit**. The My account page is read-only for all users; the password-change form remains available.

## Scope of the Admin refinement

Only **Admin** and **Employee** are interactive roles. The SRS documents inform responsibilities and UI consistency; this mockup does not implement the full SRS. Admin and Employee use separate demo identities (Daniel Kim and Shine Bo Bo). Switching roles closes any open dialog and returns to that role's home page.

Account saves and employee sharing updates add browser-local activity entries. Seeded records are explicitly labeled Sample, live demo changes are labeled Local, and timestamps use Asia/Bangkok. The history retains the latest 200 entries and is editable browser data, not a protected audit trail. Inactive or unavailable sharing participants are marked Needs review.

Backups, recovery services, SSO integration, security monitoring, encryption, enterprise policy configuration, and third-party integrations remain outside this frontend update. Existing password demonstration and the smaller 25 MB/1 GB browser limits are retained; they are not presented as completed SRS requirements.
