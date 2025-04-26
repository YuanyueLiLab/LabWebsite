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
            filename: coders.jpg
            filters:
              brightness: 0.7
          position: right
          color: '#666'
        link:
          icon: graduation-cap
          icon_pack: fas
          text: Research
          url: ../research/

      - title: Join the Li Lab 🙌
        content: 'Share your knowledge with the group and explore exciting new topics together!'
        align: center
        background:
          image:
            filename: welcome.jpg
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

  - block: hero
    content:
      title: |
        Wowchemy
        Research Group
      image:
        filename: welcome.jpg
      text: |
        <br>
        The **Wowchemy Research Group** has been a center of excellence for Artificial Intelligence research, teaching, and practice since its founding in 2016.
  
  - block: collection
    content:
      title: Latest News
      subtitle:
      text:
      count: 5
      filters:
        author: ''
        category: ''
        exclude_featured: false
        publication_type: ''
        tag: ''
      offset: 0
      order: desc
      page_type: post
    design:
      view: card
      columns: '1'
  
  - block: markdown
    content:
      title:
      subtitle: ''
      text:
    design:
      columns: '1'
      background:
        image: 
          filename: coders.jpg
          filters:
            brightness: 1
          parallax: false
          position: center
          size: cover
          text_color_light: true
      spacing:
        padding: ['20px', '0', '20px', '0']
      css_class: fullscreen

  - block: collection
    content:
      title: Latest Preprints
      text: ""
      count: 5
      filters:
        folders:
          - publication
        publication_type: 'article'
    design:
      view: citation
      columns: '1'

  - block: markdown
    content:
      title:
      subtitle:
      text: |
        {{% cta cta_link="./people/" cta_text="Meet the team →" %}}
    design:
      columns: '1'
---
