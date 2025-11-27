# UrbanGate Frontend

Professional apartment management and communication system frontend built with React and Tailwind CSS.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at http://localhost:3000

3. **Build for Production**
   ```bash
   npm run build
   ```

   Preview production build:
   ```bash
   npm run preview
   ```

## Features

- **Authentication**: Secure JWT-based login/register
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Notifications**: Socket.io integration for live updates
- **Multiple User Roles**: Resident, Admin, Security
- **Modern UI**: Clean, professional design with Tailwind CSS

### Resident Features
- Submit and track complaints
- View community announcements
- Generate and manage visitor passes
- View assigned parking slots
- Book community facilities
- View maintenance dues and make payments
- Vote in community polls

### Admin Features
- Dashboard with statistics
- Manage complaints (assign, update status)
- Create announcements
- Create polls
- Manage facilities
- View and manage payments

### Security Features
- Scan and log visitor QR codes
- View announcements

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── UI.jsx          # Button, Card, Input, Modal, etc.
│   │   └── Layout.jsx      # Header, Sidebar, Layout wrapper
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── pages/              # Feature pages
│   │   ├── Auth.jsx        # Login/Register
│   │   ├── Dashboard.jsx
│   │   ├── Complaints.jsx
│   │   ├── Announcements.jsx
│   │   ├── VisitorPass.jsx
│   │   ├── Parking.jsx
│   │   ├── Facilities.jsx
│   │   ├── Payments.jsx
│   │   └── Polls.jsx
│   ├── utils/
│   │   └── api.js          # Axios API client
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Environment Variables

Create a `.env` file (optional, as proxy is configured in vite.config.js):

```
VITE_API_URL=http://localhost:5000/api
```

## Tech Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io** - Real-time communication
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **QRCode.react** - QR code generation

## Color Scheme

- **Primary**: White (#ffffff)
- **Secondary**: Light Grey (#f5f5f5)
- **Tertiary**: Grey (#e8e8e8)
- **Text**: Dark Grey (#333333)
- **Text Light**: Medium Grey (#666666)
- **Text Lighter**: Light Grey (#999999)
- **Accent**: Dark Grey (#1f2937)

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance Optimization

- Code splitting with React Router
- Image optimization
- Lazy loading components
- Memoization of expensive components

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators for interactive elements

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
