export const treeResponse = {
  starting: [
    {
      id: "1403",
      type: "starting",
      name: "Starting",
      children: [],
    },
  ],
  structure: [
    {
      id: "1404",
      type: "structure",
      name: "Structure",
      children: [
        {
          children: [],
          eval_param:
            '{"evaluation":"evaluation","save_in_lms":true,"success_score":80,"retry_quiz":{"checked":true,"attempts":"unlimited","lock_when_success":false},"advanced":{"show_as_complete_even_if_no_succeed":false,"all_sub_eval_succeed_for_validate":false},"theme":"Large","directEvaluation":true,"related_to":"","feedback":{"checked":true,"thresholds":[{"threshold":0,"feedback":""},{"threshold":80,"feedback":""}]},"timer":{"checked":false,"value":30},"randomize_questions":{"checked":false,"value":0},"question_result":"by_question","question_feedback":"by_question","question_attempts":{"checked":false,"value":"unlimited"},"evaluationChange":false}',
          hasfeedback: "true",
          id: "2631",
          isevaluation: "true",
          name: "Evaluation with theme",
          theme_ref: "Large",
          type: "chapter",
        },
        {
          children: [
            {
              id: "7527",
              type: "page",
              name: "New page",
              connections: [{ value: "repeat" }],
              children: [],
            },
          ],
          eval_param: null,
          hasfeedback: null,
          id: "7526",
          isevaluation: null,
          name: "chap",
          theme_ref: null,
          type: "chapter",
        },
        {
          children: [
            {
              children: [],
              connections: [{ value: "repeat" }],
              id: "7241",
              name: "Screen",
              type: "screen",
            },
          ],
          eval_param:
            '{"evaluation":"not_an_evaluation","save_in_lms":true,"success_score":80,"retry_quiz":{"checked":true,"attempts":"unlimited","lock_when_success":false},"advanced":{"show_as_complete_even_if_no_succeed":false,"all_sub_eval_succeed_for_validate":false},"theme":"None","directEvaluation":false,"related_to":"","feedback":{"checked":true,"thresholds":[{"threshold":0,"feedback":""},{"threshold":80,"feedback":""}]},"timer":{"checked":false,"value":30},"randomize_questions":{"checked":false,"value":0},"question_result":"by_question","question_feedback":"by_question","question_attempts":{"checked":false,"value":"unlimited"},"evaluationChange":true}',
          hasfeedback: "true",
          id: "7221",
          isevaluation: "false",
          name: "Smoke Testing",
          theme_ref: "None",
          type: "chapter",
        },
        {
          id: "2632",
          type: "page",
          name: "Empty Page",
          connections: [],
          children: [],
        },
        {
          id: "2633",
          type: "page",
          name: "Page with templates",
          connections: [],
          children: [],
        },
      ],
    },
  ],
  annexes: [
    {
      id: "1405",
      type: "annexes",
      name: "Annexes",
      children: [],
    },
  ],
};
