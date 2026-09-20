"use client"

import React, { useEffect, useRef, useState } from "react"

export default function HeroVideoLogo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    let animId: number
    let gl: WebGLRenderingContext | null = null

    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      })
    } catch {
      gl = null
    }

    if (gl) {
      // ── WebGL GPU Accelerated Chroma/Fitting Pipeline ──
      const vsSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `

      const fsSource = `
        precision mediump float;
        uniform sampler2D u_image;
        varying vec2 v_texCoord;
        void main() {
          vec4 color = texture2D(u_image, v_texCoord);
          
          // Distance from logo center
          vec2 center = vec2(0.5, 0.48);
          vec2 aspectDiff = (v_texCoord - center) * vec2(1.0, 1.25);
          float dist = length(aspectDiff);

          // Detect white background pixels in the video
          float minRgb = min(min(color.r, color.g), color.b);
          
          if (minRgb > 0.88) {
            // White background: fit snugly with the logo and set very low opacity (12%)
            float mask = 1.0 - smoothstep(0.20, 0.38, dist);
            float whiteOpacity = 0.12 * mask;
            gl_FragColor = vec4(1.0, 1.0, 1.0, whiteOpacity);
          } else {
            // Logo graphic (shield outline, chain links, particles): fully crisp
            gl_FragColor = color;
          }
        }
      `

      const createShader = (type: number, source: string) => {
        const shader = gl!.createShader(type)
        if (!shader) return null
        gl!.shaderSource(shader, source)
        gl!.compileShader(shader)
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
          gl!.deleteShader(shader)
          return null
        }
        return shader
      }

      const vs = createShader(gl.VERTEX_SHADER, vsSource)
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource)
      if (!vs || !fs) return

      const program = gl.createProgram()
      if (!program) return
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
      gl.useProgram(program)

      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      // 2 triangles covering viewport, UV coords
      const vertices = new Float32Array([
        // pos.x, pos.y, uv.x, uv.y
        -1.0, -1.0, 0.0, 1.0,
         1.0, -1.0, 1.0, 1.0,
        -1.0,  1.0, 0.0, 0.0,
        -1.0,  1.0, 0.0, 0.0,
         1.0, -1.0, 1.0, 1.0,
         1.0,  1.0, 1.0, 0.0,
      ])
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

      const aPosition = gl.getAttribLocation(program, "a_position")
      const aTexCoord = gl.getAttribLocation(program, "a_texCoord")

      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0)

      gl.enableVertexAttribArray(aTexCoord)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8)

      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      const render = () => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          gl!.viewport(0, 0, canvas.width, canvas.height)
          gl!.bindTexture(gl!.TEXTURE_2D, texture)
          gl!.texImage2D(
            gl!.TEXTURE_2D,
            0,
            gl!.RGBA,
            gl!.RGBA,
            gl!.UNSIGNED_BYTE,
            video
          )
          gl!.drawArrays(gl!.TRIANGLES, 0, 6)
        }
        animId = requestAnimationFrame(render)
      }

      animId = requestAnimationFrame(render)
    } else {
      // ── 2D Canvas Fallback ──
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      const render2d = () => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const d = img.data
          const w = canvas.width
          const h = canvas.height
          const cx = w * 0.5
          const cy = h * 0.48

          for (let i = 0; i < d.length; i += 4) {
            const r = d[i]
            const g = d[i + 1]
            const b = d[i + 2]
            if (r > 225 && g > 225 && b > 225) {
              const px = (i / 4) % w
              const py = Math.floor(i / 4 / w)
              const dx = (px - cx) / w
              const dy = ((py - cy) / h) * 1.25
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist > 0.38) {
                d[i + 3] = 0
              } else if (dist > 0.20) {
                const fade = 1 - (dist - 0.20) / 0.18
                d[i + 3] = Math.round(30 * fade)
              } else {
                d[i + 3] = 30 // ~12% opacity
              }
            }
          }
          ctx.putImageData(img, 0, 0)
        }
        animId = requestAnimationFrame(render2d)
      }

      animId = requestAnimationFrame(render2d)
    }

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="relative w-full max-w-[480px] aspect-video flex items-center justify-center">
      {/* Hidden Video Source Element */}
      <video
        ref={videoRef}
        src="/Without_the_name_datacoop.mp4"
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Render Canvas: Displays logo with low-opacity white background fitting the logo */}
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer select-none block"
        title={isPlaying ? "Click to pause" : "Click to play"}
      />
    </div>
  )
}
