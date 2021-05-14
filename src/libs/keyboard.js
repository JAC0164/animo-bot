const cst = require("./const");
const callBackQueryType = cst.callBackQueryType;

module.exports = {
  InlineKeyboard: {
    favorite: (f) => [
      [
        {
          text: "🔗 Url",
          url: f.url,
        },
        {
          text: "🗑",
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
          text: "😩",
          callback_data: JSON.stringify({
            type: callBackQueryType.FEEDBACK_T,
            value: "😩",
          }),
        },
        {
          text: "😐",
          callback_data: JSON.stringify({
            type: callBackQueryType.FEEDBACK_T,
            value: "😐",
          }),
        },
        {
          text: "🤩",
          callback_data: JSON.stringify({
            type: callBackQueryType.FEEDBACK_T,
            value: "🤩",
          }),
        },
      ],
    ],
    showMore: (url, id, favorite) => {
      return [
        [
          { text: "🔗 Url", url },
          {
            text: favorite,
            callback_data: JSON.stringify({
              type: callBackQueryType.FAVORITE_T,
              animeId: id,
              value: favorite,
            }),
          },
        ],
        [
          {
            text: "⬇️ More",
            callback_data: JSON.stringify({
              type: callBackQueryType.SHOW_MORE_T,
              animeId: id,
            }),
          },
        ],
      ];
    },
    showLess: (url, id, favorite) => {
      return [
        [
          { text: "🔗 Url", url },
          {
            text: favorite,
            callback_data: JSON.stringify({
              type: callBackQueryType.FAVORITE_T,
              animeId: id,
              value: favorite,
            }),
          },
        ],
        [
          {
            text: "⬆️ Less",
            callback_data: JSON.stringify({
              type: callBackQueryType.SHOW_LESS_T,
              animeId: id,
            }),
          },
        ],
      ];
    },
    stop: [
      [
        {
          text: "Yes",
          callback_data: JSON.stringify({
            type: callBackQueryType.CONFIRM_STOP_T,
            value: "Yes",
          }),
        },
        {
          text: "No",
          callback_data: JSON.stringify({
            type: callBackQueryType.CONFIRM_STOP_T,
            value: "No",
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
