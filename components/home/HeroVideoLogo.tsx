"use client"

import React, { useEffect, useRef } from "react"

export default function HeroVideoLogo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    let animId: number
    let gl: WebGLRenderingContext | null = null

    try {
      gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: true,
      })
    } catch {
      gl = null
    }

    if (gl) {
      // ── WebGL GPU Accelerated Pipeline: Transform Video Background to Home Page Color ──
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

          // Home page background color: #1B3A5C -> rgb(27.0, 58.0, 92.0)
          vec3 pageBg = vec3(0.1059, 0.2275, 0.3608);

          // Detect white background pixels in the video
          float minRgb = min(min(color.r, color.g), color.b);

          if (minRgb > 0.83) {
            // Smoothly blend white background into the exact home page background color (#1B3A5C)
            float t = smoothstep(0.83, 0.94, minRgb);
            vec3 blended = mix(color.rgb, pageBg, t);
            gl_FragColor = vec4(blended, 1.0);
          } else {
            // Keep logo (shield, chains, particles) vivid and crisp
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
      const vertices = new Float32Array([
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

      const pageR = 27
      const pageG = 58
      const pageB = 92

      const render2d = () => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const d = img.data

          for (let i = 0; i < d.length; i += 4) {
            const minVal = Math.min(d[i], d[i + 1], d[i + 2])
            if (minVal > 212) {
              const t = Math.min(1, Math.max(0, (minVal - 212) / 28))
              d[i] = Math.round(d[i] * (1 - t) + pageR * t)
              d[i + 1] = Math.round(d[i + 1] * (1 - t) + pageG * t)
              d[i + 2] = Math.round(d[i + 2] * (1 - t) + pageB * t)
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

  return (
    <div className="relative w-full max-w-[500px] aspect-video flex items-center justify-center overflow-hidden">
      {/* Hidden Video Source: autoplays, loops continuously, muted */}
      <video
        ref={videoRef}
        src="/Without_the_name_datacoop.mp4"
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Render Canvas: displays video with background matched to home page background (#1B3A5C) and zero action buttons */}
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full object-contain block pointer-events-none select-none bg-[#1B3A5C]"
      />
    </div>
  )
}
