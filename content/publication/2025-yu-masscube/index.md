---
title: 'MassCube: a Python framework for end-to-end metabolomics data processing from
  raw files to phenotype classifiers'

# Authors
# A YAML list of author names
# If you created a profile for a user (e.g. the default `admin` user at `content/authors/admin/`), 
# write the username (folder name) here, and it will be replaced with their full name and linked to their profile.
authors:
- Huaxu Yu
- Jun Ding
- Tong Shen
- Min Liu
- Yuanyue Li
- Oliver Fiehn

# Author notes (such as 'Equal Contribution')
# A YAML list of notes for each author in the above `authors` list
author_notes: []

date: '2025-01-01'

# Date to publish webpage (NOT necessarily Bibtex publication's date).
publishDate: '2025-05-01T06:27:59.903855Z'

# Publication type.
# A single CSL publication type but formatted as a YAML list (for Hugo requirements).
publication_types:
- manuscript

# Publication name and optional abbreviated publication name.
publication: '*Springer Science and Business Media LLC*'
publication_short: ''

doi: 10.21203/rs.3.rs-5530740/v1

abstract: Abstract        Nontargeted peak detection in LC-MS-based metabolomics must
  become robust and benchmarked. We present MassCube, a Python-based open-source framework
  for MS data processing that we systematically benchmarked against other algorithms
  and different types of input data. From raw data, peaks are detected by constructing
  mass traces through signal clustering and Gaussian-filter assisted edge detection.
  Peaks are then grouped for adduct and in-source fragment detection, and compounds
  are annotated by both identity- and fuzzy searches. Final data tables undergo quality
  controls and can be used for metabolome-informed phenotype prediction. Peak detection
  in MassCube achieves 100% signal coverage with comprehensive reporting of chromatographic
  metadata for quality assurance. MassCube outperforms MS-DIAL, MZmine3 or XCMS for
  speed, isomer detection, and accuracy. It supports diverse numerical routines for
  MS data analysis while maintaining efficiency, capable for handling 105 GB of Astral
  MS data on a laptop within 64 minutes, while other programs took 8-24 times longer.
  MassCube automatically detected age, sex and regional differences when applied to
  the Metabolome Atlas of the Aging Mouse Brain data despite batch effects. MassCube
  is available at https://github.com/huaxuyu/masscube for direct use or implementation
  into larger applications in omics or biomedical research.

# Summary. An optional shortened abstract.
summary: ''

tags: []

# Display this page in a list of Featured pages?
featured: false

# Links
url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Custom links (uncomment lines below)
# links:
# - name: Custom Link
#   url: http://example.org

# Publication image
# Add an image named `featured.jpg/png` to your page's folder then add a caption below.
image:
  caption: ''
  focal_point: ''
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects: ['internal-project']` links to `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: []
links:
- name: URL
  url: https://www.researchsquare.com/article/rs-5530740/v1
---
