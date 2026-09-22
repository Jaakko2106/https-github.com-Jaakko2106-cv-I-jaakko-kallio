
export interface ProjectImage {
    url: string;
    caption?: string;
    type?: 'image' | 'video';
    title?: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    images: ProjectImage[];
    coverImage: string;
    client?: string;
    projectType?: string;
    tools?: string[];
}
