import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

interface Skill {
    name: string;
    level: number;
}

interface SkillNode extends d3.SimulationNodeDatum {
    id: string;
    group: 'design' | 'software' | 'center';
    name: string;
    level: number;
    description: string;
    radius: number;
}

interface SkillLink extends d3.SimulationLinkDatum<SkillNode> {
    source: string | SkillNode;
    target: string | SkillNode;
}

interface Props {
    softwareSkills: Skill[];
    designSkills: Skill[];
}

const softwareSkillInfo: Record<string, string> = {
    "Adobe Photoshop": "Expert in photo manipulation, retouching, and raster graphic creation.",
    "Adobe Illustrator": "Advanced vector graphics, logo design, and scalable illustrations.",
    "Adobe InDesign": "Professional layout design for print media, magazines, and typography.",
    "Figma / Sketch": "Prototyping, UI/UX design, and collaborative interface building.",
    "After Effects": "Motion graphics and visual effects for dynamic content.",
    "Premiere Pro": "Video editing and post-production workflows."
};

const designSkillInfo: Record<string, string> = {
    "UI/UX Design": "Creating user-centric interfaces and optimized user experiences.",
    "Brand Identity": "Developing comprehensive visual identities and brand guidelines.",
    "Web Design": "Designing responsive and aesthetic web pages for digital presence.",
    "Print Media": "Preparing high-quality graphics and layouts for physical production.",
    "Visual Storytelling": "Conveying narratives and emotion through compelling visual design."
};

const InteractiveSkillNetwork: React.FC<Props> = ({ softwareSkills, designSkills }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<SkillNode[]>([]);
    const [links, setLinks] = useState<SkillLink[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

    // Initialization and Simulation
    useEffect(() => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setDimensions({ width, height });

        const centerNode: SkillNode = {
            id: 'center',
            group: 'center',
            name: 'Skills',
            level: 100,
            description: 'Core skill proficiencies.',
            radius: 40,
            x: width / 2,
            y: height / 2,
            vx: 0,
            vy: 0
        };

        const generateNodes = (skills: Skill[], group: 'design' | 'software', infoDict: Record<string, string>) => 
            skills.map(s => ({
                id: s.name,
                group,
                name: s.name,
                level: s.level,
                description: infoDict[s.name] || `${s.name} proficiency.`,
                radius: 25 + (s.level / 100) * 20, // scale based on level
                x: width / 2 + (Math.random() - 0.5) * 100,
                y: height / 2 + (Math.random() - 0.5) * 100
            }));

        const sNodes = generateNodes(softwareSkills, 'software', softwareSkillInfo);
        const dNodes = generateNodes(designSkills, 'design', designSkillInfo);
        
        const allNodes: SkillNode[] = [centerNode, ...sNodes, ...dNodes];
        
        const allLinks: SkillLink[] = [
            ...sNodes.map(n => ({ source: 'center', target: n.id })),
            ...dNodes.map(n => ({ source: 'center', target: n.id }))
        ];

        // Setup D3 simulation
        const simulation = d3.forceSimulation<SkillNode>(allNodes)
            .force('link', d3.forceLink<SkillNode, SkillLink>(allLinks).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide<SkillNode>().radius(d => d.radius + 10).iterations(2))
            .on('tick', () => {
                // Update React state on each tick
                setNodes([...allNodes]);
                setLinks([...allLinks]);
            });

        // Add drag behavior handling natively in d3 is tricky with React render, 
        // but for read-only floaty networks, we can just let it settle or gently float.
        // Let's add a gentle continuous force to make them slowly orbit or float.
        
        const floatInterval = setInterval(() => {
            simulation.alpha(0.1).restart();
        }, 3000);

        const handleResize = () => {
            if (!containerRef.current) return;
            const newW = containerRef.current.clientWidth;
            const newH = containerRef.current.clientHeight;
            setDimensions({ width: newW, height: newH });
            simulation.force('center', d3.forceCenter(newW / 2, newH / 2));
            simulation.alpha(0.3).restart();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            simulation.stop();
            clearInterval(floatInterval);
            window.removeEventListener('resize', handleResize);
        };
    }, [softwareSkills, designSkills]);

    return (
        <div className="relative w-full h-[600px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-50 dark:border-indigo-900/30 overflow-hidden" ref={containerRef}>
            <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                <g stroke="#9ca3af" strokeOpacity="0.4" strokeWidth="2">
                    {links.map((link, i) => {
                        const source = link.source as SkillNode;
                        const target = link.target as SkillNode;
                        return (
                            <line 
                                key={i}
                                x1={source.x} y1={source.y}
                                x2={target.x} y2={target.y}
                            />
                        );
                    })}
                </g>
            </svg>

            {nodes.map(node => (
                <motion.div
                    key={node.id}
                    className={`absolute rounded-full flex items-center justify-center text-center cursor-pointer shadow-md text-white transition-colors
                        ${node.group === 'center' ? 'bg-indigo-600 font-bold z-10' : 
                          node.group === 'design' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-blue-500 hover:bg-blue-400'}`}
                    style={{
                        width: node.radius * 2,
                        height: node.radius * 2,
                    }}
                    animate={{
                        x: (node.x || 0) - node.radius,
                        y: (node.y || 0) - node.radius,
                    }}
                    transition={{ type: "tween", duration: 0.1, ease: "linear" }}
                    onClick={() => node.group !== 'center' && setSelectedNode(node)}
                >
                    <span className="text-xs font-semibold px-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {node.name}
                    </span>
                </motion.div>
            ))}

            <AnimatePresence>
                {selectedNode && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-5 border border-indigo-100 dark:border-gray-700 z-50 pointer-events-auto"
                    >
                        <button 
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            onClick={() => setSelectedNode(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-3 h-3 rounded-full ${selectedNode.group === 'design' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{selectedNode.name}</h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                            {selectedNode.description}
                        </p>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${selectedNode.group === 'design' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${selectedNode.level}%` }}
                            ></div>
                        </div>
                        <div className="text-right text-xs font-semibold mt-1 text-gray-500 dark:text-gray-400">
                            Proficiency: {selectedNode.level}%
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Design Methodologies</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Software Tools</span>
                </div>
                <div className="text-xs text-gray-400 mt-2 italic">Click nodes to expand</div>
            </div>
        </div>
    );
};

export default InteractiveSkillNetwork;
