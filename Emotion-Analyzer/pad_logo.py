from PIL import Image

def pad_image(image_path, output_path, padding_percent=0.25):
    img = Image.open(image_path)
    # Background color is black (#000000)
    bg_color = (0, 0, 0, 255)
    
    # Calculate new size with padding
    width, height = img.size
    new_width = int(width * (1 + padding_percent))
    new_height = int(height * (1 + padding_percent))
    
    # Create new image with black background
    new_img = Image.new("RGBA", (new_width, new_height), bg_color)
    
    # Paste original image in the center
    offset = ((new_width - width) // 2, (new_height - height) // 2)
    new_img.paste(img, offset)
    
    # Save the result
    new_img.save(output_path)
    print(f"Saved padded logo to {output_path}")

if __name__ == "__main__":
    pad_image("../public/Logo.svg", "../public/Logo-padded.png")
