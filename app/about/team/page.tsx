import Image from 'next/image'
import Breadcrumbs from '@/components/Breadcrumbs'
import { currentTeam, formerTeamMembers, formerVisiting } from '@/content/team'

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-10 pb-6 md:pt-12 md:pb-8 hero-background-network-image border-b border-gray-200">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight">Team</h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed">Meet the researchers behind PaCE.</p>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTeam.map((member, index) => (
              <article key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-pace-red transition-all duration-300">
                <div className="aspect-square relative bg-gray-100">
                  <Image src={member.photo} alt={member.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-pace-red mb-1">{member.role}</p>
                  <h3 className="text-xl font-light text-gray-900 mb-3">{member.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-pace-red hover:text-pace-red-dark text-sm">
                      {member.email}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Former Team Members */}
          <div className="mt-16">
            <h2 className="text-2xl font-light text-gray-900 mb-6">Former Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formerTeamMembers.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h4 className="text-lg font-light text-gray-900">{member.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{member.role}</p>
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-pace-red hover:text-pace-red-dark text-sm">
                      {member.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Former Visiting Research Fellows */}
          <div className="mt-12">
            <h2 className="text-2xl font-light text-gray-900 mb-6">Former Visiting Research Fellows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formerVisiting.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h4 className="text-lg font-light text-gray-900">{member.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{member.role}</p>
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-pace-red hover:text-pace-red-dark text-sm">
                      {member.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

