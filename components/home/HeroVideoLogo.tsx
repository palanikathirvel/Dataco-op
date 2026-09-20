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

    // Ensure audio is strictly muted so all browsers permit autoplay
    video.muted = true
    video.defaultMuted = true

    const startPlayback = () => {
      if (video.paused) {
        video.play().catch(() => {
          // If browser requires user interaction first, listen on window
          const resumeOnGesture = () => {
            video.play().catch(() => {})
            window.removeEventListener("click", resumeOnGesture)
            window.removeEventListener("touchstart", resumeOnGesture)
          }
          window.addEventListener("click", resumeOnGesture, { once: true })
          window.addEventListener("touchstart", resumeOnGesture, { once: true })
        })
      }
    }

    video.addEventListener("loadeddata", startPlayback)
    video.addEventListener("canplay", startPlayback)
    startPlayback()

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
      // ── WebGL GPU Pipeline: Strip White/Cream Background Completely (100% Transparent) ──
      const vsSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        uniform vec2 u_scale;
        uniform vec2 u_center;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = u_center + (a_texCoord - vec2(0.5, 0.5)) * u_scale;
        }
      `

      const fsSource = `
        precision mediump float;
        uniform sampler2D u_image;
        varying vec2 v_texCoord;

        void main() {
          // Beyond frame boundaries, render 100% transparent
          if (v_texCoord.x < 0.0 || v_texCoord.x > 1.0 || v_texCoord.y < 0.0 || v_texCoord.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            return;
          }

          vec4 color = texture2D(u_image, v_texCoord);

          // Detect light / cream / white background pixels in the video
          float minRgb = min(min(color.r, color.g), color.b);

          if (minRgb > 0.77) {
            // Background: 100% transparent (no background)
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          } else if (minRgb > 0.65) {
            // Smooth edge antialiasing
            float alpha = 1.0 - (minRgb - 0.65) / 0.12;
            gl_FragColor = vec4(color.rgb, alpha);
          } else {
            // Logo graphic (shield, red chain links, circuits): fully crisp & opaque
            gl_FragColor = vec4(color.rgb, 1.0);
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
      const uScale = gl.getUniformLocation(program, "u_scale")
      const uCenter = gl.getUniformLocation(program, "u_center")

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
          gl!.clearColor(0.0, 0.0, 0.0, 0.0)
          gl!.clear(gl!.COLOR_BUFFER_BIT)
          gl!.bindTexture(gl!.TEXTURE_2D, texture)
          gl!.texImage2D(
            gl!.TEXTURE_2D,
            0,
            gl!.RGBA,
            gl!.RGBA,
            gl!.UNSIGNED_BYTE,
            video
          )

          const vw = video.videoWidth || 720
          const vh = video.videoHeight || 1280
          const canvasAspect = canvas.width / canvas.height
          const videoAspect = vw / vh

          let scaleX = 1.0
          let scaleY = 1.0
          let centerX = 0.5
          let centerY = 0.5

          if (videoAspect < 1.0) {
            // Portrait video: adaptively scale and center without aspect distortion
            const aspectCorr = canvasAspect / videoAspect
            const zoom = 0.58
            scaleX = aspectCorr * zoom
            scaleY = zoom
            centerX = 0.498
            centerY = 0.486
          }

          if (uScale) gl!.uniform2f(uScale, scaleX, scaleY)
          if (uCenter) gl!.uniform2f(uCenter, centerX, centerY)

          gl!.drawArrays(gl!.TRIANGLES, 0, 6)
        }
        animId = requestAnimationFrame(render)
      }

      animId = requestAnimationFrame(render)
    } else {
      // ── 2D Canvas Fallback (100% Transparent Background) ──
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      const render2d = () => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          const vw = video.videoWidth || 720
          const vh = video.videoHeight || 1280
          const canvasAspect = canvas.width / canvas.height
          const videoAspect = vw / vh

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (videoAspect < 1.0) {
            const zoom = 0.58
            const sw = vw * (canvasAspect / videoAspect) * zoom
            const sh = vh * zoom
            const sx = vw * 0.498 - sw / 2
            const sy = vh * 0.486 - sh / 2
            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          }

          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const d = img.data

          for (let i = 0; i < d.length; i += 4) {
            const minVal = Math.min(d[i], d[i + 1], d[i + 2])
            if (minVal > 196) {
              d[i + 3] = 0 // Transparent background
            } else if (minVal > 165) {
              const alpha = 1 - (minVal - 165) / 31
              d[i + 3] = Math.round(255 * alpha)
            }
          }
          ctx.putImageData(img, 0, 0)
        }
        animId = requestAnimationFrame(render2d)
      }

      animId = requestAnimationFrame(render2d)
    }

    return () => {
      video.removeEventListener("loadeddata", startPlayback)
      video.removeEventListener("canplay", startPlayback)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div className="relative w-full max-w-[650px] lg:max-w-[700px] xl:max-w-[780px] aspect-video flex items-center justify-center bg-transparent">
      {/* Active Video Element in DOM (not hidden, ensuring browsers continuously decode frames) */}
      <video
        ref={videoRef}
        src="/without_name_generate_image_no.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none -z-10"
      />

      {/* Render Canvas: 100% transparent background, crisp logo, zero action buttons */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-contain block pointer-events-none select-none bg-transparent"
      />
    </div>
  )
}
