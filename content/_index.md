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
        content: Take a look at what we're working on...
        align: center
        background:
          image:
            filename: sky.jpg
            filters:
              brightness: 0.7
          position: right
          color: '#666'
        link:
          icon: palette
          icon_pack: fas
          text: Research
          url: ../research/

      - title: 🙌 Join the Li Lab
        content: Let's explore the world of science together!
        align: center
        background:
          image:
            filename: sky.jpg
            filters:
              brightness: 0.7
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
