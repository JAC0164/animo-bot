const cst = require('./const');
const callBackQueryType = cst.callBackQueryType;

module.exports = {
  InlineKeyboard: {
    favorite: (f) => [
      [
        {
          text: '🔗 Url',
          url: f.url,
        },
        {
          text: '🗑',
          callback_data: JSON.stringify({
            type: callBackQueryType.RM_FAVORITE_T,
            animeId: f.id,
          }),
        },
      ],
    ],
    feedbacks: () => [
      [
        {
          text: '😩',
          callback_data: JSON.stringify({
            type: callBackQueryType.FEEDBACK_T,
            value: '😩',
          }),
        },
        {
          text: '😐',
          callback_data: JSON.stringify({
            type: callBackQueryType.FEEDBACK_T,
            value: '😐',
          }),
        },
        {
          text: '🤩',
          callback_data: JSON.stringify({
            type: callBackQueryType.FEEDBACK_T,
            value: '🤩',
          }),
        },
      ],
    ],
    showMore: (url, id, favorite, current, subtype) => {
      return [
        [
          { text: '🔗 Url', url },
          {
            text: favorite,
            callback_data: JSON.stringify({
              type: callBackQueryType.FAVORITE_T,
              data: `${id}-${current}-${subtype}-${favorite}`,
            }),
          },
        ],
        [
          {
            text: 'More',
            callback_data: JSON.stringify({
              type: callBackQueryType.SHOW_MORE_T,
              data: `${id}-${current}-${subtype}`,
            }),
          },
        ],
        typeof current === 'number' && !isNaN(current)
          ? [
              {
                text: '<',
                callback_data: JSON.stringify({
                  type: 'pagination',
                  data: `${current > 0 ? current - 1 : current}-${subtype}`,
                }),
              },
              {
                text: '<<',
                callback_data: JSON.stringify({
                  type: 'pagination',
                  data: `0-${subtype}`,
                }),
              },
              {
                text: `${current + 1}`,
                callback_data: JSON.stringify({
                  type: 'pagination',
                  data: `${current}-${subtype}`,
                }),
              },
              {
                text: '>>',
                callback_data: JSON.stringify({
                  type: 'pagination',
                  data: `49-${subtype}`,
                }),
              },
              {
                text: '>',
                callback_data: JSON.stringify({
                  type: 'pagination',
                  data: `${current < 49 ? current + 1 : 49}-${subtype}`,
                }),
              },
            ]
          : [],
      ];
    },
    showLess: (id, current, subtype) => {
      return [
        [
          {
            text: 'Less',
            callback_data: JSON.stringify({
              type: callBackQueryType.SHOW_LESS_T,
              data: `${id}-${current}-${subtype}`,
            }),
          },
        ],
      ];
    },
    stop: [
      [
        {
          text: 'Yes',
          callback_data: JSON.stringify({
            type: callBackQueryType.CONFIRM_STOP_T,
            value: 'Yes',
          }),
        },
        {
          text: 'No',
          callback_data: JSON.stringify({
            type: callBackQueryType.CONFIRM_STOP_T,
            value: 'No',
          }),
        },
      ],
    ],
    noShowAgain: [
      [
        {
          text: "Don't show again",
          callback_data: JSON.stringify({
            type: callBackQueryType.NO_SHOW_AGAIN_T,
          }),
        },
      ],
    ],
  },
};
