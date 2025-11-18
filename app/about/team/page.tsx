import Image from 'next/image'

interface TeamMember {
  name: string
  role: string
  photo: string
  bio: string
  email: string
}

interface FormerMember {
  name: string
  role: string
  email?: string
}

const currentTeam: TeamMember[] = [
  {
    name: "Professor Thomas Chadefaux",
    role: "Principal Investigator",
    photo: "/team/chadefauxERC.jpg",
    bio: "Thomas studied Public Administration in Strasbourg, International Politics in Geneva, and received a PhD in Political Science from the University of Michigan in 2009. His research interests include the causes of war, conflict forecasting, and political methodology. He is currently the principal investigator of ERC grant PaCE: Patterns of Conflict Escalation (2022-26).",
    email: "thomas.chadefaux@tcd.ie"
  },
  {
    name: "Emmanuel Akeweje",
    role: "PhD Student",
    photo: "/team/Emmanuel photo_edited.jpg",
    bio: "Emmanuel is a PhD candidate at Trinity College Dublin, where he conducts research on developing algorithms for clustering functional and longitudinal data. He has a strong mathematical background, having obtained two master's degrees in Mathematical Sciences and Data Science from the African Institute of Mathematical Sciences in Ghana and the Skolkovo Institute of Science and Technology in Moscow, respectively. His research interests span across Applied Mathematics, Statistics, and Machine Learning.",
    email: "eakeweje@tcd.ie"
  },
  {
    name: "Dr Jemimah Bailey",
    role: "Project Manager",
    photo: "/team/Jemimah Bailey photo 2022.jpg",
    bio: "Jemimah was awarded a MSc in Applied Social Research and a PhD in Sociology from Trinity College Dublin. She has worked on a number of EU funded research projects and currently acts as project manager for PaCE, supporting the team's research activities; liaising with colleagues across Trinity College and beyond; managing the website and events.",
    email: "baileyje@tcd.ie"
  },
  {
    name: "Dr Jungmin Han",
    role: "Research Fellow",
    photo: "/team/Jungmin Han photo_edited_edited.jpg",
    bio: "Jungmin Han is a postdoctoral researcher at Trinity College Dublin. With a primary interest in international rivalry, foreign policy, and public behaviours in democracy, the motivation of his research is to enhance understanding of the micro-foundation of enduring rivalries and their domestic consequences. He employs a multi-method research strategy to generate empirical insights, including quantitative analyses of observational and experimental data and machine-learning approaches.",
    email: "jhan@tcd.ie"
  },
  {
    name: "Junjie Liu",
    role: "PhD Student",
    photo: "/team/Junjie photo_edited_edited.jpg",
    bio: "Junjie holds an MPhil degree in Probability and Mathematical Statistics from Hong Kong Baptist University, and his research interests include statistical inference, spatio-temporal model, and text analysis. He is currently a PhD student at Trinity College Dublin and investigating conflict forecasting.",
    email: "liuj13@tcd.ie"
  },
  {
    name: "Dr Chien Lu",
    role: "Research Fellow",
    photo: "/team/Chien Lu profile photo_edited_edited_edi.jpg",
    bio: "Chien Lu is currently a research fellow in the PaCE project. He obtained his Ph.D. from Tampere University in Finland. His dissertation explored the intersection of machine learning with a focus on probabilistic representation learning methods and game culture studies. His research interests are centered on developing computational methods to study social phenomena, with an emphasis on probabilistic machine learning, and Bayesian data analysis.",
    email: "luc4@tcd.ie"
  },
  {
    name: "Dr Yohan Park",
    role: "Research Fellow",
    photo: "/team/YohanPark_edited_edited.jpg",
    bio: "Yohan is currently working in the PaCE project team at Trinity College Dublin as a research fellow. He received a Ph.D. in Political Science at Texas A&M University. His research focuses on the study of conflict processes and political economy, with a particular interest in the use of machine learning and statistical methods to analyse these topics.",
    email: "yohan.park@tcd.ie"
  },
  {
    name: "Dr Guoxin Wang",
    role: "Research Fellow",
    photo: "/team/G Wang.jpg",
    bio: "Guoxin was awarded a PhD from University College Dublin in 2024. He developed an MAE-based pretraining framework for ECG analysis and an ECG biometric authentication approach using self-supervised learning for IoT edge sensors. Earlier, he worked on continuous user authentication using a genuine wearable chest-strap ECG device. He is currently a research fellow in the PaCE project team at Trinity College Dublin. His research interests include self- and unsupervised learning for physiological time-series (ECG), wearable sensing and edge AI, efficient deployment (quantization, pruning), and dynamic neural networks.",
    email: ""
  }
]

const formerTeamMembers: FormerMember[] = [
  {
    name: "Jian Cao",
    role: "Research Fellow (2022-2024)",
    email: "caoj@tcd.ie"
  },
  {
    name: "Gareth Lomax",
    role: "Research Assistant (2022-23)"
  },
  {
    name: "Thomas Schincariol",
    role: "PhD Student (2021-2025)",
    email: "schincat@tcd.ie"
  },
  {
    name: "Hannah Frank",
    role: "PhD Student (2021-2025)",
    email: "frankh@tcd.ie"
  }
]

const formerVisiting: FormerMember[] = [
  {
    name: "Christian Oswald",
    role: "Visiting Research Fellow (Feb-June 2025)",
    email: "coswald@tcd.ie"
  }
]

export default function TeamPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Team
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Meet the <span className="word-emphasis">PaCE Research Lab</span> team at Trinity College Dublin.
            Our interdisciplinary group combines expertise in political science, statistics, machine learning, and computational methods.
          </p>
        </div>
      </section>

      {/* Current Team */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTeam.map((member, index) => (
              <article
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-clairient-blue transition-all duration-300"
              >
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-clairient-blue mb-1">{member.role}</p>
                  <h3 className="text-xl font-light text-gray-900 mb-3">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-clairient-blue hover:text-clairient-dark text-sm"
                    >
                      {member.email}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Former Team Members */}
          <div className="mt-16">
            <h2 className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Former Team Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formerTeamMembers.map((member, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <h3 className="text-lg font-light text-gray-900">{member.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{member.role}</p>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-clairient-blue hover:text-clairient-dark text-sm"
                    >
                      {member.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Former Visiting Research Fellows */}
          <div className="mt-12">
            <h2 className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Former Visiting Research Fellows
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formerVisiting.map((member, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <h3 className="text-lg font-light text-gray-900">{member.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{member.role}</p>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-clairient-blue hover:text-clairient-dark text-sm"
                    >
                      {member.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-2">
              Email us at:{' '}
              <a
                href="mailto:conflictlabresearch@gmail.com"
                className="text-clairient-blue hover:text-clairient-dark"
              >
                conflictlabresearch@gmail.com
              </a>
            </p>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              The views, thoughts, and opinions expressed on this page belong solely to the team members and do not necessarily reflect the views of their employers, organizations, or institutions.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
