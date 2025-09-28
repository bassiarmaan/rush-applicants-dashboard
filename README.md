# Rush Applicants Dashboard

A comprehensive web application for managing fraternity rush applicants with password protection, applicant tracking, and detailed applicant profiles.

## Features

- **Password-Protected Access**: Secure login system to protect applicant data
- **Applicant Dashboard**: Overview of all applicants with search and filtering
- **Individual Applicant Pages**: Detailed view of each applicant with all information
- **Airtable Integration**: Fetches data from your Airtable base
- **Resume Downloads**: Access to applicant resume files
- **Photo Display**: View applicant photos
- **Notes System**: Add and track interactions with applicants
- **Rush Day Tracking**: Track which rush days each applicant attended
- **Status Management**: Update applicant status (Ongoing/Rejected)
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# Dashboard Password (change this to a secure password)
DASHBOARD_PASSWORD=your_secure_password_here

# JWT Secret for authentication
JWT_SECRET=your_super_secret_jwt_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Airtable Setup

The application expects your Airtable base to have the following structure:

### Applicants Table
- `applicant_name` (Text)
- `email` (Email)
- `year` (Number)
- `major` (Text)
- `essay_1` (Long text)
- `essay_2` (Text)
- `resume` (Attachment)
- `photo` (URL)
- `notes` (Long text)
- `status` (Single select: "Rejected", "Ongoing")
- `day_1` (Checkbox)
- `day_2` (Checkbox)
- `day_3` (Checkbox)
- `day_4` (Checkbox)
- `day_5` (Checkbox)
- `created_at` (Created time)

### Interactions Table
- `applicant_id` (Text)
- `author_email` (Email)
- `note` (Long text)
- `created_at` (Created time)

## Usage

1. **Login**: Access the dashboard with the password set in your environment variables
2. **View Applicants**: Browse all applicants on the main dashboard
3. **Search**: Use the search bar to find specific applicants by name, email, or major
4. **View Details**: Click on any applicant to see their full profile
5. **Add Notes**: Add notes and interactions for each applicant
6. **Update Status**: Edit applicant information and status
7. **Track Rush Days**: See which rush days each applicant attended

## Security

- Password-protected access
- JWT-based authentication
- Secure cookie handling
- Environment variable protection

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Airtable API**: Data source integration
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

## Deployment

For production deployment:

1. Set secure environment variables
2. Change the default password
3. Use a strong JWT secret
4. Enable HTTPS
5. Consider additional security measures

## Support

For issues or questions, please check the application logs and ensure your Airtable API credentials are correct.
