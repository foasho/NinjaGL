

export const Lighting = () => {

  return (
    <>
      <ambientLight intensity={0.75} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} />
      <rectAreaLight intensity={3} position={[-2, 3, 2]} width={30} height={30} />
    </>
  )
}