const adminPermissions = [
    {
        "rolePermission": "Dashboard",
        "functions": [
            {
                "name": "Dashboard",
                "route": "/admin"
            },
            // {
            //     "name": "View Staff Schedules",
            //     "route": "/admin/staff-schedules"
            // }
        ]
    },
    {
        "rolePermission": "Salon Configuration",
        "functions": [
            {
                "name": "Services",
                "route": "/admin/service-configurations"
            },
            {
                "name": "Prices",
                "route": "/admin/price-configurations"
            },
            {
                "name": "Staff Profiles",
                "route": "/admin/staff-profile-configurations"
            }
        ]
    },
    {
        "rolePermission": "User Management",
        "functions": [
            {
                "name": "Manage Roles",
                "route": "/admin/roles"
            },
            {
                "name": "Access Control",
                "route": "/admin/access-control"
            }
        ]
    },
    {
        "rolePermission": "Feedback Management",
        "functions": [
            {
                "name": "Review Feedback",
                "route": "/admin/feedback-reviews"
            }
        ]
    },
    {
        "rolePermission": "Reports",
        "functions": [
            {
                "name": "Generate Reports",
                "route": "/admin/reports"
            }
        ]
    }
];

module.exports = { adminPermissions };