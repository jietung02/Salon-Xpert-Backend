const guestPermissions = [
    {
      "rolePermission": "Guest",
      "functions": [
        {
          "name": "Feedback & Ratings",
          "route": "/guest/feedback-ratings"
        }
      ]
    }
  ]

module.exports = { guestPermissions };