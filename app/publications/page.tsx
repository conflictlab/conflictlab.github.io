import Link from 'next/link'

interface Publication {
  year: number
  authors: string
  title: string
  venue: string
  abstract: string
}

const publications: Publication[] = [
  {
    year: 2025,
    authors: "Lu C, & Chadefaux T.",
    title: "Structured Pixels: Satellite Imagery as the Cause in Causal Effect Estimation",
    venue: "Hawaii International Conference on System Sciences",
    abstract: "We present Structured Pixels (SP), a causal inference model that positions satellite imagery as a cause/treatment in a causal graph, rather than merely a proxy for outcomes or confounders. Built on the generalized Robinson decomposition and a two-step, R-learner-inspired algorithm, SP uses learned latent representations to partial out confounding influences and isolate the causal effect. Its modular training pipeline supports integration with diverse machine learning models across domains. We evaluate SP using semi-synthesized datasets on two tasks: the impact of environmental conditions on mosquito populations and the influence of coastal characteristics on dark vessel prevalence. SP consistently outperforms baseline methods, and its learned representations capture meaningful environmental patterns. We further demonstrate SP's applicability by re-examining the relationship between deforestation and agricultural productivity with real-world data; the results align with prior work. These findings highlight SP's potential to advance GeoAI for environmental monitoring and resource management."
  },
  {
    year: 2025,
    authors: "Hegre H, et al (including Schincariol T, Frank H & Chadefaux T)",
    title: "The 2023/24 VIEWS Prediction challenge: Predicting the number of fatalities in armed conflict, with uncertainty",
    venue: "Journal of Peace Research",
    abstract: "Governmental and nongovernmental organizations have increasingly relied on early-warning systems of conflict to support their decisionmaking. Predictions of war intensity as probability distributions prove closer to what policymakers need than point estimates, as they encompass useful representations of both the most likely outcome and the lower-probability risk that conflicts escalate catastrophically. Point-estimate predictions, by contrast, fail to represent the inherent uncertainty in the distribution of conflict fatalities. Yet, current early warning systems are preponderantly focused on providing point estimates, while efforts to forecast conflict fatalities as a probability distribution remain sparse. Building on the predecessor VIEWS competition, we organize a prediction challenge to encourage endeavours in this direction. We invite researchers across multiple disciplinary fields, from conflict studies to computer science, to forecast the number of fatalities in state-based armed conflicts, in the form of the UCDP 'best' estimates aggregated to two units of analysis (country-months and PRIO-GRID-months), with estimates of uncertainty. This article introduces the goal and motivation behind the prediction challenge, presents a set of evaluation metrics to assess the performance of the forecasting models, describes the benchmark models which the contributions are evaluated against, and summarizes the salient features of the submitted contributions."
  },
  {
    year: 2025,
    authors: "Han J, Han X & Zhang A",
    title: "How China's Multilateral Engagement Shapes Threat Perception Amid Rising Authoritarianism",
    venue: "Journal of Contemporary China",
    abstract: "Despite increased contributions to key UN-affiliated intergovernmental organizations (IGOs) under Xi Jinping, American skepticism about its motives in global affairs persists. This paper examines this puzzle by exploring how China's authoritarian image interacts with its multilateral engagement to shape public opinion. We argue that when China's authoritarianism is primed, its IGO participation is perceived not as integration, but as a strategic effort to undermine the Liberal International Order, thus reinforcing its threat perceptions. Evidence from an original survey experiment supports this claim: American respondents exposed only to a report about China's IGO contributions viewed it as less threatening, but this effect disappears when paired with a video clip on China's authoritarianism. This finding provides insights into the microfoundation of the recently escalating US-China rivalry."
  },
  {
    year: 2025,
    authors: "Finkel M, et al (including Han J)",
    title: "Intersectional Hatred - An Application of Large Language Models to Detect Hate and Offensive Speech Targeted at Congressional Candidates in the 2024 U.S. Election",
    venue: "Conference Proceedings: The ACM Web Conference",
    abstract: "In this paper we take an intersectional approach to the problem of understanding hate and offensive speech targeted at all candidates who ran for Congress in the 2024 U.S. elections. We used a series of language models to analyze posts on X for instances of hate and offensive speech. This was based on a dataset of over 800,000 posts on X collected between May 20 and August 23, 2024. We found that, on average, more than 1 in 5 tweets targeted at Asian-American and African- American women candidates contained offensive speech, a higher proportion than other candidates. We also found that, on average, African- American women candidates were four times more likely than others to be targeted with hate speech, three times as likely as white women, and more than 18 times as likely as white men. These findings support prior research that women of color political candidates are more likely to be targeted with online abuse, a pattern which has important implications for the quality of American democracy."
  },
  {
    year: 2025,
    authors: "Schincariol T, Frank H & Chadefaux T",
    title: "Accounting for variability in conflict dynamics: A pattern-based predictive model",
    venue: "Journal of Peace Research",
    abstract: "Existing models for predicting conflict fatalities frequently produce conservative forecasts that gravitate towards the mean. While these approaches have a low average prediction error, they offer limited insights into temporal variations in conflict-related fatalities. Yet, accounting for variability is particularly relevant for policymakers, providing an indication on when to intervene. In this article, we introduce a novel risk-taking methodology, the 'Shape finder', designed to capture variability in fatality data, or rather the sudden surges and declines in the number of deaths over time. The method involves isolating historically analogous sequences of fatalities to create a reference repository. Comparing the shape of the input sequence to the historical references, the most similar historical cases are selected. Predictions are then generated using the average future outcomes of the selected matches. The Shape finder is derived from the theoretical understanding that strategic and adaptive interactions between the government and a non-state armed group produce recurring temporal patterns in fatality data, which are indicative of broader developments. In this article, we demonstrate that our approach maintains high accuracy while significantly enhancing the ability to predict shifts, surges, and declines in conflict fatalities over time. We show that combining the Shape finder with existing approaches, the Violence Early-Warning System ensemble, achieves a lower mean squared error and better accounts for variability in fatality data. The Shape finder methodology performs particularly well for high intensity cases, or rather country-months with substantial armed violence."
  },
  {
    year: 2025,
    authors: "Wu S, Luo X, Liu J & Deng Y",
    title: "Knowledge distillation with adapted weight",
    venue: "Statistics: A Journal of Theoretical and Applied Statistics",
    abstract: "Although large models have shown a strong capacity to solve large-scale problems in many areas including natural language and computer vision, their voluminous parameters are hard to deploy in a real-time system due to computational and energy constraints. Addressing this, knowledge distillation through Teacher-Student architecture offers a sustainable pathway to compress the knowledge of large models into more manageable sizes without significantly compromising performance. To enhance the robustness and interpretability of this framework, it is critical to understand how individual training data impact model performance, which is an area that remains underexplored. We propose the Knowledge Distillation with Adaptive Influence Weight (KD-AIF) framework which leverages influence functions from robust statistics to assign weights to training data, grounded in the four key SAFE principles: Sustainability, Accuracy, Fairness, and Explainability. This novel approach not only optimizes distillation but also increases transparency by revealing the significance of different data. The exploration of various update mechanisms within the KD-AIF framework further elucidates its potential to significantly improve learning efficiency and generalization in student models, marking a step toward more explainable and deployable Large Models. KD-AIF is effective in knowledge distillation while also showing exceptional performance in semi-supervised learning with outperforms existing baselines and methods in multiple benchmarks (CIFAR-100, CIFAR-10-4k, SVHN-1k, and GLUE)."
  },
  {
    year: 2024,
    authors: "Akeweje E & Zhang M",
    title: "Learning Mixtures of Gaussian Processes through Random Projection",
    venue: "Proceedings of Machine Learning Research",
    abstract: "We propose an ensemble clustering framework to uncover latent cluster labels in functional data generated from a Gaussian process mixture. Our method exploits the fact that the projection coefficients of the functional data onto any given projection function follow a univariate Gaussian mixture model (GMM). By conducting multiple one-dimensional projections and learning a univariate GMM for each, we create an ensemble of GMMs. Each GMM serves as a base clustering, and applying ensemble clustering yields a consensus clustering. Our approach significantly reduces computational complexity compared to state-of-the-art methods, and we provide theoretical guarantees on the identifiability and learnability of Gaussian process mixtures. Extensive experiments on synthetic and real datasets confirm the superiority of our method over existing techniques."
  },
  {
    year: 2024,
    authors: "Schincariol T, & Chadefaux T.",
    title: "Temporal Patterns in Migration Flows: Evidence from South Sudan",
    venue: "Journal of Forecasting",
    abstract: "What explains the variation in migration flows over time and space? Existing work has contributed to a rich understanding of the factors that affect why and when people leave. What is less understood are the dynamics of migration flows over time. Existing work typically focuses on static variables at the country-year level and ignores the temporal dynamics. Are there recurring temporal patterns in migration flows? And can we use these patterns to improve our forecasts of the number of migrants? Here, we introduce new methods to uncover temporal sequences—motifs—in the number of migrants over time and use these motifs for forecasting. By developing a multivariable shape similarity-based model, we show that temporal patterns do exist. Moreover, using these patterns results in better out-of-sample forecasts than a benchmark of statistical and neural networks models. We apply the new method to the case of South Sudan."
  },
  {
    year: 2024,
    authors: "Jung Y. S. & Park, Y.",
    title: "Winners and Losers in U.S.-China Trade Disputes: A Dynamic Compositional Analysis of Multinational Corporations' Market Penetration",
    venue: "Social Science Quarterly",
    abstract: "The trade conflicts between the United States and China have significantly disrupted global trade and economic growth. In today's globalized economy where the production of goods and services spans across multiple nations, these disputes have far-reaching consequences that extend beyond the involved parties and impact the broader global economy. We examine the effects of the U.S.-China trade disputes on multinational investment patterns in China and Southeast Asia. Using a dynamic compositional approach, we analyze data on firm-level greenfield foreign direct investment. We observe European firms increasing their investments in China to enhance market penetration, while American firms are withdrawing, redirecting their focus toward Southeast Asia to mitigate dependence on the Chinese market. This shift highlights broader international business strategy trends amid geopolitical and economic changes. The results indicate significant transformations in global supply chains, shedding light on the extensive effects of U.S.–China trade tensions on global economic equilibrium and how these tensions are reshaping international investment and supply chain dynamics."
  },
  {
    year: 2024,
    authors: "Crisman-Cox, C., & Park, Y.",
    title: "Remittances, terrorism, and democracy",
    venue: "Conflict Management and Peace Science",
    abstract: "How do remittances affect domestic terrorism? Past work argues that remittances increase groups' resources and increase terrorism. However, we argue that the effect of remittances depends on political institutions. Within democracies, remittances can help groups overcome barriers to legitimate politics and reduce terrorism's allure. Within autocracies, however, fewer legitimate political opportunities exist, and remittances may lead to more terrorism as it remains an alternative and available political outlet. We find that remittances are associated with less (more) domestic terrorism within democracies (autocracies) and use additional mechanism tests to demonstrate that the competitive aspects of democracy help explain these trends."
  },
  {
    year: 2024,
    authors: "Cao J and Chadefaux T.",
    title: "Dynamic Synthetic Controls: Accounting for Varying Speeds in Comparative Case Studies",
    venue: "Political Analysis",
    abstract: "Synthetic controls are widely used to estimate the causal effect of a treatment. However, they do not account for the different speeds at which units respond to changes. Reactions may be inelastic or \"sticky\" and thus slower due to varying regulatory, institutional, or political environments. We show that these different reaction speeds can lead to biased estimates of causal effects. We therefore introduce a dynamic synthetic control approach that accommodates varying speeds in time series, resulting in improved synthetic control estimates. We apply our method to re-estimate the effects of terrorism on income, tobacco laws on consumption, and German reunification on GDP. We also assess the method's performance using Monte-Carlo simulations. We find that it reduces errors in the estimates of true treatment effects by up to 70% compared to traditional synthetic controls, improving our ability to make robust inferences. An open-source R package, dsc, is made available for easy implementation."
  },
  {
    year: 2023,
    authors: "Chadefaux T.",
    title: "An automated pattern recognition system for conflict",
    venue: "Journal of Computational Science",
    abstract: "This article introduces an automated pattern recognition system for conflict. The monitoring system aims to uncover, cluster, and classify temporal patterns of escalation to improve future forecasts and better understand the causes of escalation toward war. It identifies important temporal patterns in conflict data using novel pattern detection methods and new data. These patterns are used to forecast conflict, with live predictions released in real time. Finally, the discovery of recurring motifs—prototypes—can inform new or existing theoretical frameworks. In this article, I discuss the methodological innovations required to achieve these goals and the path to creating an autonomous conflict monitoring system. I also report on promising results obtained using these methods, which show that they perform well on true out-of- sample forecasts of the count of the number of fatalities per month from state-based conflict. The monitoring system has important implications for computational diplomacy, as it can alert diplomats of geopolitical risks."
  },
  {
    year: 2022,
    authors: "Boussalis C., Chadefaux T., Salvi A. and Decadri S.",
    title: "Public and Private Information in International Crises: Diplomatic Correspondence and Conflict Anticipation",
    venue: "International Studies Quarterly 66(4)",
    abstract: "Scholars of international conflicts have long emphasized the role of private information in the onset of interstate wars. Yet, the literature lacks direct and systematic evidence of its effect. This is largely due to challenges with accessing decision-makers' private and often confidential information and opinions. We compile a large corpus of declassified French diplomatic cables that span the period 1871–1914. Using these texts, we estimate a dynamic topic model to generate diplomatic thematic variables, which are then used to forecast the onset of French Militarized Interstate Disputes (MIDs). The inclusion of information from diplomatic correspondence greatly improves estimates of MID timing, compared to models that rely solely on public information such as structural determinants and revealed risk perceptions derived from financial markets or the press. These results emphasize the importance of private information in decisions to go to war and the limitations of empirical work that relies solely on publicly available data."
  },
  {
    year: 2022,
    authors: "Chadefaux T.",
    title: "A shape-based approach to conflict forecasting",
    venue: "International Interactions 48(4)",
    abstract: "Do conflict processes exhibit repeating patterns over time? And if so, can we exploit the recurring shapes and structures of the time series to forecast the evolution of conflict? Theory has long focused on the sequence of events that precedes conflicts (e.g., escalation or brinkmanship). Yet, current empirical research is unable to represent these complex interactions unfolding over time because it attempts to match cases on the raw value of covariates, and not on their structure or shape. As a result, it cannot easily represent real-world relations which may, for example, follow a long alternation of escalation and détente, in various orders and at various speeds. Here, I aim to address these issues using recent machine-learning methods derived from pattern recognition in time series to study the dynamics of casualties in civil war processes. I find that the methods perform well on out-of-sample forecasts of the count of the number of fatalities per month from state-based conflict. In particular, our results yield Mean Squared Errors that are lower than the competition benchmark. We discuss the implication for conflict research and the importance of comparing entire sequences rather than isolated observations in time."
  },
  {
    year: 2022,
    authors: "Turkoglu O., Chadefaux T.",
    title: "The effect of terrorist attacks on attitudes and its duration",
    venue: "Political Science Research and Methods (First View)",
    abstract: "Is terrorism effective as a tool of political influence? In particular, do terrorists succeed in affecting their targets' attitudes, and how long does the effect last? Existing research unfortunately is either limited to small samples or does not address two main difficulties: issues of endogeneity and the inability to assess the duration of the effect. Here, we first exploit the exogeneity to the selection process of the success or failure of an attack as an identification mechanism. Second, we take advantage of the random allocation of survey respondents to interview times to estimate the duration of the impact of terrorist events on attitudes. Using survey data from 30 European democracies between 2002 and 2017, we find first that terrorism affects people's reported life satisfaction and happiness—a proxy for the cost of terrorism in terms of utility. However, we also find that terrorist attacks do not affect respondents' attitude toward their government, institutions, or immigrants. This suggests that terrorism is ineffective at translating discontent into political pressure. Importantly, we also find that all effects disappear within less than two weeks."
  }
]

export default function PublicationsPage() {
  // Group publications by year
  const publicationsByYear = publications.reduce((acc, pub) => {
    if (!acc[pub.year]) {
      acc[pub.year] = []
    }
    acc[pub.year].push(pub)
    return acc
  }, {} as Record<number, Publication[]>)

  const years = Object.keys(publicationsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Publications
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Research publications from the <span className="word-emphasis">PaCE Conflict Research Lab</span>.
            Peer-reviewed papers on conflict forecasting, pattern recognition, and computational methods.
          </p>
        </div>
      </section>

      {/* Publications by year */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {years.map((year) => (
              <div key={year} className="space-y-6">
                <h2 className="text-3xl font-light text-gray-900 border-b border-gray-200 pb-2">
                  {year}
                </h2>
                <div className="space-y-8">
                  {publicationsByYear[year].map((pub, index) => (
                    <article
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 bg-white hover:border-clairient-blue transition-all duration-300"
                    >
                      {/* Authors */}
                      <p className="text-sm text-gray-600 mb-2">{pub.authors}</p>

                      {/* Title */}
                      <h3 className="text-xl font-light text-gray-900 mb-2">
                        {pub.title}
                      </h3>

                      {/* Venue */}
                      <p className="text-clairient-blue italic mb-4">{pub.venue}</p>

                      {/* Abstract */}
                      <details className="group">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-900 transition-colors list-none">
                          <span className="inline-flex items-center">
                            <span className="mr-2 group-open:rotate-90 transition-transform">▶</span>
                            Abstract
                          </span>
                        </summary>
                        <p className="mt-3 text-gray-600 leading-relaxed pl-6">
                          {pub.abstract}
                        </p>
                      </details>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              The views, thoughts, and opinions expressed on this page belong solely to the authors and do not necessarily reflect the views of their employers, organizations, or institutions.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
