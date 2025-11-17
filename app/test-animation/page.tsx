import NeuralNetworkAnimation from '@/components/NeuralNetworkAnimation'

export default function TestAnimation() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        
        <div>
          <h1 className="text-3xl font-bold text-center mb-8">Neural Network Intelligence</h1>
          <NeuralNetworkAnimation />
          <div className="mt-8 text-center text-gray-600">
            <p>Deep learning neural network processing geopolitical intelligence:</p>
            <ul className="mt-4 space-y-2">
              <li><strong>Building Neural Architecture:</strong> Multi-layer network structure initializes</li>
              <li><strong>Training & Learning Patterns:</strong> Network learns from geopolitical data patterns</li>
              <li><strong>Processing Geopolitical Data:</strong> Real-time analysis of economic, social, political signals</li>
              <li><strong>Generating Risk Predictions:</strong> Output layer produces conflict risk, stability, and impact predictions</li>
            </ul>
            <p className="mt-4 text-sm">Visualizes Luscint&#39;s AI engine transforming raw data into actionable intelligence</p>
            <p className="mt-2 text-sm text-blue-600">Watch data flow through layers with pulsing neurons and connection weights!</p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
