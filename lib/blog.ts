import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface BlogPost {
    slug: string
    title: string
    date: string
    description: string
    author: string
    image?: string
    content: string
}

export function getPosts(): BlogPost[] {
    // Create dir if missing
    if (!fs.existsSync(postsDirectory)) {
        return []
    }

    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".mdx" from file name to get id
        const slug = fileName.replace(/\.mdx$/, '')

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents)

        return {
            slug,
            content: matterResult.content,
            ...(matterResult.data as Omit<BlogPost, 'slug' | 'content'>),
        }
    })

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1
        } else {
            return -1
        }
    })
}

export function getPostBySlug(slug: string): BlogPost | null {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.mdx`)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = matter(fileContents)

        return {
            slug,
            content: matterResult.content,
            ...(matterResult.data as Omit<BlogPost, 'slug' | 'content'>),
        }
    } catch (error) {
        return null
    }
}
