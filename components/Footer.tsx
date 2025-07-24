import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-clairient-light mb-4">Clairient</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Forecasting the future of conflict and risk through advanced machine learning 
              and geopolitical intelligence.
            </p>
            <p className="text-gray-400 text-sm">
              Transforming uncertainty into strategic foresight.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/" className="hover:text-clairient-light transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-clairient-light transition-colors">About</Link></li>
              <li><Link href="/technology" className="hover:text-clairient-light transition-colors">Technology</Link></li>
              <li><Link href="/use-cases" className="hover:text-clairient-light transition-colors">Use Cases</Link></li>
              <li><Link href="/dashboard" className="hover:text-clairient-light transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="mailto:contact@clairient.com" className="hover:text-clairient-light transition-colors">
                  contact@clairient.com
                </a>
              </li>
              <li><Link href="/contact" className="hover:text-clairient-light transition-colors">Get in Touch</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Clairient. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}