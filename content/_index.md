---
# Leave the homepage title empty to use the site title
title:
date: 2025-04-26
type: landing

sections:
  - block: slider
    content:
      slides:
      - title: 👋 Welcome to the Li Lab
        content: We are a lab focused on metabolomics, AI, and big data.          
        align: center
        background:
          image:
            filename: sky.jpg
          position: right
          color: '#666'
        link:
          icon: magnifying-glass
          icon_pack: fas
          text: Take a look at what we're working on
          url: ../research/

      - title: 🔭 Join the Li Lab
        content: Let's explore the world of science together!
        align: center
        background:
          image:
            filename: earth_from_moon.jpg
          position: center
          color: '#555'
        link:
          icon: graduation-cap
          icon_pack: fas
          text: Join Us
          url: ../hiring/

    design:
      # Slide height is automatic unless you force a specific height (e.g. '400px')
      slide_height: ''
      is_fullscreen: true
      # Automatically transition through slides?
      loop: true
      # Duration of transition between slides (in ms)
      interval: 5000

---
