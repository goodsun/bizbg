import { CONST } from "../common/const.js";

export const NotionMember = {
  create: {
    parent: {
      database_id: CONST.NOTION_DATABASE_ID,
    },
    icon: {
      type: "external",
      external: {
        url: "http://extample.com",
      },
    },
    properties: {
      name: {
        title: [{ text: { content: "DiscordName" } }],
      },
      id: {
        number: 0,
      },
      icon: {
        files: [],
      },
      roles: {
        multi_select: {},
      },
      join: {
        date: {
          start: "",
        },
      },
    },
  },
  update: {
    page_id: "pageid",
    icon: {
      type: "external",
      external: {
        url: "http://extample.com",
      },
    },
    properties: {
      name: {
        title: [{ text: { content: "DiscordName" } }],
      },
      id: {
        number: 0,
      },
      roles: {
        multi_select: {},
      },
      join: {
        date: {
          start: "",
        },
      },
      icon: {
        files: [],
      },
      exit: {
        checkbox: false,
      },
    },
  },
  delete: {
    page_id: "pageid",
    properties: { exit: { checkbox: true } },
  },
};
