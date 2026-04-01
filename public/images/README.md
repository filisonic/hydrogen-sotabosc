# Images Directory Structure

This directory contains all static images for the Sotabosc storefront.

## Naming Convention

Each section uses a consistent naming pattern for easy management:

- **Hero Section**: `/images/hero/hero-image.jpg`
  - Rename your hero image to `hero-image.jpg` and place it in this folder
  - Used in: Homepage hero section

- **About Section**: `/images/about/about-image.jpg` (if needed)
  - Rename your about page image to `about-image.jpg` and place it in this folder
  - Used in: About page (when implemented)

- **Labs Section**: `/images/labs/labs-image.jpg` (if needed)
  - Rename your labs page image to `labs-image.jpg` and place it in this folder
  - Used in: Labs page hero section (when implemented)

- **Products Section**: `/images/products/` (for product-specific images)
  - Product images are typically handled by Shopify, but you can add custom product images here if needed

## How to Update Images

1. **Hero Image**: 
   - Take your desired image
   - Rename it to `hero-image.jpg` (or `.jpeg` if that's your format)
   - Replace the file in `/public/images/hero/`
   - The homepage will automatically use the new image

2. **Other Sections**: 
   - Follow the same pattern: rename to `{section}-image.jpg`
   - Place in the appropriate folder
   - Update the code to reference the new filename if needed

## Image Formats

- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- Recommended: `.jpg` or `.webp` for best performance
- Max file size: Keep under 500KB for optimal loading

## Notes

- All images in `/public/` are served statically
- Images are referenced with paths starting with `/images/`
- The `CustomImage` component handles placeholder display if an image is missing