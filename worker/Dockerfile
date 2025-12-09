# Use a lightweight Debian-based Node image
FROM node:18-bullseye-slim

# Install TeX Live and other dependencies
# texlive-latex-recommended: Basic LaTeX packages
# texlive-fonts-recommended: Common fonts
# texlive-latex-extra: More packages (often needed)
# latexmk: The build tool
# make: Useful for some builds
RUN apt-get update && apt-get install -y \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-fonts-extra \
    latexmk \
    chktex \
    make \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create temp_work directory
RUN mkdir -p temp_work

# Start the worker
CMD ["npm", "start"]
