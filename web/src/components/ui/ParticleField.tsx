'use client'

import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

export default function ParticleField() {
    const [init, setInit] = useState(false)

    useEffect(() => {
        initParticlesEngine(async engine => {
            await loadSlim(engine)
        }).then(() => {
            setInit(true)
        })
    }, [])

    const options: ISourceOptions = useMemo(
        () => ({
            fullScreen: { enable: false },
            background: {
                color: { value: 'transparent' }
            },
            fpsLimit: 30,
            particles: {
                color: {
                    value: ['#3b82f6', '#a855f7', '#22c55e', '#f97316', '#ec4899']
                },
                links: {
                    enable: false
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    outModes: {
                        default: 'out'
                    }
                },
                number: {
                    value: 40,
                    density: {
                        enable: true,
                        area: 800
                    }
                },
                opacity: {
                    value: { min: 0.5, max: 1 },
                    animation: {
                        enable: true,
                        speed: 1,
                        minimumValue: 0.3,
                        sync: false
                    }
                },
                shape: {
                    type: 'circle'
                },
                size: {
                    value: { min: 2, max: 5 },
                    animation: {
                        enable: true,
                        speed: 2,
                        minimumValue: 1,
                        sync: false
                    }
                },
                shadow: {
                    enable: true,
                    blur: 15,
                    color: {
                        value: '#3b82f6'
                    }
                }
            },
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: 'grab'
                    }
                },
                modes: {
                    grab: {
                        distance: 200,
                        links: {
                            opacity: 0.6,
                            color: '#3b82f6'
                        }
                    }
                }
            },
            detectRetina: true
        }),
        []
    )

    if (!init) return null

    return (
        <Particles
            id="tsparticles"
            options={options}
            className="absolute inset-0 z-[1] pointer-events-none"
        />
    )
}
