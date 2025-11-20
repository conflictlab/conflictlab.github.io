export interface Publication {
  year: number
  authors: string
  title: string
  venue: string
  abstract: string
  url?: string
}

export const publications: Publication[] = [
  {
    year: 2026,
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
    abstract: "Governmental and nongovernmental organizations have increasingly relied on early-warning systems of conflict to support their decisionmaking. Predictions of war intensity as probability distributions prove closer to what policymakers need than point estimates, as they encompass useful representations of both the most likely outcome and the lower-probability risk that conflicts escalate catastrophically. Point-estimate predictions, by contrast, fail to represent the inherent uncertainty in the distribution of conflict fatalities. Yet, current early warning systems are preponderantly focused on providing point estimates, while efforts to forecast conflict fatalities as a probability distribution remain sparse. Building on the predecessor VIEWS competition, we organize a prediction challenge to encourage endeavours in this direction. We invite researchers across multiple disciplinary fields, from conflict studies to computer science, to forecast the number of fatalities in state-based armed conflicts, in the form of the UCDP 'best' estimates aggregated to two units of analysis (country-months and PRIO-GRID-months), with estimates of uncertainty. This article introduces the goal and motivation behind the prediction challenge, presents a set of evaluation metrics to assess the performance of the forecasting models, describes the benchmark models which the contributions are evaluated against, and summarizes the salient features of the submitted contributions.",
    url: "https://journals.sagepub.com/doi/full/10.1177/00223433241300862"
  },
  {
    year: 2025,
    authors: "Han J, Han X & Zhang A",
    title: "How China's Multilateral Engagement Shapes Threat Perception Amid Rising Authoritarianism",
    venue: "Journal of Contemporary China",
    abstract: "Despite increased contributions to key UN-affiliated intergovernmental organizations (IGOs) under Xi Jinping, American skepticism about its motives in global affairs persists. This paper examines this puzzle by exploring how China's authoritarian image interacts with its multilateral engagement to shape public opinion. We argue that when China's authoritarianism is primed, its IGO participation is perceived not as integration, but as a strategic effort to undermine the Liberal International Order, thus reinforcing its threat perceptions. Evidence from an original survey experiment supports this claim: American respondents exposed only to a report about China's IGO contributions viewed it as less threatening, but this effect disappears when paired with a video clip on China's authoritarianism. This finding provides insights into the microfoundation of the recently escalating US-China rivalry.",
    url: "https://www.tandfonline.com/doi/full/10.1080/10670564.2025.2549103"
  },
  {
    year: 2025,
    authors: "Schincariol T, Frank H & Chadefaux T",
    title: "Accounting for variability in conflict dynamics: A pattern-based predictive model",
    venue: "Journal of Peace Research",
    abstract: "Existing models for predicting conflict fatalities frequently produce conservative forecasts that gravitate towards the mean. While these approaches have a low average prediction error, they offer limited insights into temporal variations in conflict-related fatalities. Yet, accounting for variability is particularly relevant for policymakers, providing an indication on when to intervene. In this article, we introduce a novel risk-taking methodology, the 'Shape finder', designed to capture variability in fatality data, or rather the sudden surges and declines in the number of deaths over time. The method involves isolating historically analogous sequences of fatalities to create a reference repository. Comparing the shape of the input sequence to the historical references, the most similar historical cases are selected. Predictions are then generated using the average future outcomes of the selected matches. The Shape finder is derived from the theoretical understanding that strategic and adaptive interactions between the government and a non-state armed group produce recurring temporal patterns in fatality data, which are indicative of broader developments. In this article, we demonstrate that our approach maintains high accuracy while significantly enhancing the ability to predict shifts, surges, and declines in conflict fatalities over time. We show that combining the Shape finder with existing approaches, the Violence Early-Warning System ensemble, achieves a lower mean squared error and better accounts for variability in fatality data. The Shape finder methodology performs particularly well for high intensity cases, or rather country-months with substantial armed violence.",
    url: "https://journals.sagepub.com/doi/10.1177/00223433251330790"
  },
  {
    year: 2022,
    authors: "Turkoglu O., Chadefaux T.",
    title: "The effect of terrorist attacks on attitudes and its duration",
    venue: "Political Science Research and Methods (First View)",
    abstract: "Is terrorism effective as a tool of political influence? In particular, do terrorists succeed in affecting their targets' attitudes, and how long does the effect last? Existing research unfortunately is either limited to small samples or does not address two main difficulties: issues of endogeneity and the inability to assess the duration of the effect. Here, we first exploit the exogeneity to the selection process of the success or failure of an attack as an identification mechanism. Second, we take advantage of the random allocation of survey respondents to interview times to estimate the duration of the impact of terrorist events on attitudes. Using survey data from 30 European democracies between 2002 and 2017, we find first that terrorism affects people's reported life satisfaction and happiness—a proxy for the cost of terrorism in terms of utility. However, we also find that terrorist attacks do not affect respondents' attitude toward their government, institutions, or immigrants. This suggests that terrorism is ineffective at translating discontent into political pressure. Importantly, we also find that all effects disappear within less than two weeks.",
    url: "https://www.cambridge.org/core/journals/political-science-research-and-methods/article/effect-of-terrorist-attacks-on-attitudes-and-its-duration/79F97080265041F026C407844B983B3D"
  }
]

