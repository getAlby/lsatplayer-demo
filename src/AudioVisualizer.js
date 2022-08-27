import React, { HTMLProps, RefObject, useEffect, useRef } from "react"
import useMeasure from "react-use-measure"

function RealAudioVisualizer({
  amplitude = 1,
  analyser,
  ...props
}) {
  const [container, bounds] = useMeasure()
  const canvas = useRef();

  useEffect(() => {
    if (!canvas.current) return
    let animationFrame

    function render() {
      const frequencyBinCountArray = new Uint8Array(analyser.frequencyBinCount)
      const barCount = canvas.current.width / 2

      analyser.getByteFrequencyData(frequencyBinCountArray)

      const context = canvas.current.getContext("2d")
      context.clearRect(0, 0, canvas.current.width, canvas.current.height)
      context.fillStyle = "#ffffff"

      for (let i = 0; i < barCount; i++) {
        const barPosition = i * 4
        const barWidth = 2
        // Negative so it goes to the top.
        const barHeight = -(frequencyBinCountArray[i] / 2) * amplitude

        context.fillRect(
          barPosition,
          canvas.current.height,
          barWidth,
          barHeight
        )
      }

      animationFrame = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrame)
      analyser.disconnect()
    }
  }, [amplitude, analyser, canvas])

  return (
    <div ref={container} {...props}>
      <canvas ref={canvas} height={bounds.height} width={bounds.width} />
    </div>
  )
}

// This is an wrapper to RealAudioVisualizer.
export default function AudioVisualizer(props) {
  if (window.AudioContext || window.webkitAudioContext) {
    return <RealAudioVisualizer {...props} />
  } else {
    return <>Your browser doesn&apos;t support audio contexts</>
  }
}
