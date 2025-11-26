export interface ResumeSection {
    id: string
    title: string
    content: string
    startLine: number
    endLine: number
}

export const parseLatexSections = (latexContent: string): ResumeSection[] => {
    const sections: ResumeSection[] = []
    const lines = latexContent.split('\n')

    let currentSection: ResumeSection | null = null

    // Regex to match \section{Title} or \section*{Title}
    const sectionRegex = /\\section\*?\{([^}]+)\}/

    lines.forEach((line, index) => {
        const match = line.match(sectionRegex)

        if (match) {
            // If we were tracking a section, finish it
            if (currentSection) {
                currentSection.endLine = index - 1
                currentSection.content = lines.slice(currentSection.startLine, index).join('\n')
                sections.push(currentSection)
            }

            // Start new section
            const title = match[1]
            currentSection = {
                id: title.toLowerCase().replace(/\s+/g, '-'),
                title: title,
                content: '',
                startLine: index,
                endLine: -1
            }
        }
    })

    // Push the last section
    if (currentSection) {
        currentSection.endLine = lines.length - 1
        currentSection.content = lines.slice(currentSection.startLine).join('\n')
        sections.push(currentSection)
    }

    return sections
}
