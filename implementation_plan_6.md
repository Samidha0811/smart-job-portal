# Logout Confirmation Popup

Implement a confirmation dialog when the admin clicks the logout button to prevent accidental logouts.

## Proposed Changes

### Common Components
- [NEW] [views/components/popup.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/components/popup.ejs): A reusable Bootstrap modal component.

### Admin Dashboard
- [MODIFY] [views/admin.ejs](file:///c:/Users/Shivam/Desktop/Workspace/smart-job-portal/views/admin.ejs):
    - Integrate the common popup.
    - Change the logout link to trigger the modal.
    - Add JavaScript to handle the confirmation and final logout redirect.

## Verification Plan
1. Navigate to the Admin Dashboard.
2. Click the Logout button.
3. Verify that a confirmation popup appears.
4. Verify that clicking "Cancel" (Close) does nothing.
5. Verify that clicking "Logout" (Confirm) redirects to the login page and clears the session.
