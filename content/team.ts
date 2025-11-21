export interface TeamMember {
  name: string
  role: string
  photo: string
  bio: string
  email: string
}

export interface FormerMember {
  name: string
  role: string
  email?: string
}

export const currentTeam: TeamMember[] = [
  {
    name: "Professor Thomas Chadefaux",
    role: "Principal Investigator",
    photo: "/team/chadefaux.jpg",
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

export const formerTeamMembers: FormerMember[] = [
  { name: "Jian Cao", role: "Research Fellow (2022-2024)", email: "caoj@tcd.ie" },
  { name: "Gareth Lomax", role: "Research Assistant (2022-23)" },
  { name: "Thomas Schincariol", role: "PhD Student (2021-2025)", email: "schincat@tcd.ie" },
  { name: "Hannah Frank", role: "PhD Student (2021-2025)", email: "frankh@tcd.ie" }
]

export const formerVisiting: FormerMember[] = [
  { name: "Christian Oswald", role: "Visiting Research Fellow (Feb-June 2025)", email: "coswald@tcd.ie" }
]

