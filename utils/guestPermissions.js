const guestPermissions = [
    {
      "rolePermission": "Guest",
      "functions": [
        {
          "name": "Home",
          "route": "/guest"
        },
        {
          "name": "Feedback & Ratings",
          "route": "/guest/feedback-ratings"
        }
      ]
    }
  ]

module.exports = { guestPermissions };