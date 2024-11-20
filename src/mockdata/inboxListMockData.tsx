import React from "react";
import { ImageSourcePropType } from "react-native";

import {
  ChatIcon,
  ChatwootIcon,
  OpenIcon,
  ResolvedIcon,
  SnoozedIcon,
  UserIcon,
} from "../svg-icons";
import { tailwind } from "../theme";

type AssigneeData = {
  name: string;
  imageSource: ImageSourcePropType;
};

export type InboxCellType = {
  name: string;
  id: number;
  assignee: AssigneeData;
  timestamp: Date;
  notification: string;
  notificationIcon: JSX.Element;
  notificationBgColor: string;
};

export const inboxListData: InboxCellType[] = [
  {
    name: "Kristin Watson",
    id: 124,
    assignee: {
      name: "R",
      imageSource: require("../assets/local/avatars-small/avatar.png"),
    },
    timestamp: new Date(),
    notification: "Roger sent a new message",
    notificationIcon: <ChatwootIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-blue-700",
  },
  {
    name: "Brooklyn Simmons",
    id: 183,
    assignee: {
      name: "K",
      imageSource: require("../assets/local/avatars-small/avatar1.png"),
    },
    timestamp: new Date(),
    notification: "Kimber resolved this conversation",
    notificationIcon: <ResolvedIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-green-700",
  },
  {
    name: "Bessie Cooper",
    id: 70,
    assignee: {
      name: "R",
      imageSource: require("../assets/local/avatars-small/avatar3.png"),
    },
    timestamp: new Date(),
    notification: "Richard made a comment",
    notificationIcon: <ChatIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-olive-700",
  },
  {
    name: "Jane Cooper",
    id: 521,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar2.png"),
    },
    timestamp: new Date(),
    notification: "James mentioned you in a comment",
    notificationIcon: <ChatIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-orange-700",
  },
  {
    name: "Savannah Nguyen",
    id: 32,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar4.png"),
    },
    timestamp: new Date(),
    notification: "Sarah assigned the conversation to you",
    notificationIcon: <UserIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-cyan-700",
  },
  {
    name: "Cameron Williamson",
    id: 511,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar5.png"),
    },
    timestamp: new Date(),
    notification: "Alyssa snoozed this conversation",
    notificationIcon: <SnoozedIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-yellow-800",
  },
  {
    name: "Kristin Watson",
    id: 125,
    assignee: {
      name: "R",
      imageSource: require("../assets/local/avatars-small/avatar.png"),
    },
    timestamp: new Date(),
    notification: "Steve opened a new issue",
    notificationIcon: <OpenIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-blue-700",
  },
  {
    name: "Brooklyn Simmons",
    id: 184,
    assignee: {
      name: "K",
      imageSource: require("../assets/local/avatars-small/avatar1.png"),
    },
    timestamp: new Date(),
    notification: "Kimber resolved this conversation",
    notificationIcon: <ResolvedIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-green-700",
  },
  {
    name: "Bessie Cooper",
    id: 71,
    assignee: {
      name: "R",
      imageSource: require("../assets/local/avatars-small/avatar3.png"),
    },
    timestamp: new Date(),
    notification: "Richard made a comment",
    notificationIcon: <ChatIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-olive-700",
  },
  {
    name: "Jane Cooper",
    id: 522,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar2.png"),
    },
    timestamp: new Date(),
    notification: "James mentioned you in a comment",
    notificationIcon: <ChatIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-orange-700",
  },
  {
    name: "Savannah Nguyen",
    id: 33,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar4.png"),
    },
    timestamp: new Date(),
    notification: "Sarah assigned the conversation to you",
    notificationIcon: <UserIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-cyan-700",
  },
  {
    name: "Cameron Williamson",
    id: 512,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar5.png"),
    },
    timestamp: new Date(),
    notification: "Alyssa snoozed this conversation",
    notificationIcon: <SnoozedIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-yellow-800",
  },
  {
    name: "Kristin Watson",
    id: 129,
    assignee: {
      name: "R",
      imageSource: require("../assets/local/avatars-small/avatar.png"),
    },
    timestamp: new Date(),
    notification: "Roger sent a new message",
    notificationIcon: <ChatwootIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-blue-700",
  },
  {
    name: "Brooklyn Simmons",
    id: 189,
    assignee: {
      name: "K",
      imageSource: require("../assets/local/avatars-small/avatar1.png"),
    },
    timestamp: new Date(),
    notification: "Kimber resolved this conversation",
    notificationIcon: <ResolvedIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-green-700",
  },
  {
    name: "Bessie Cooper",
    id: 79,
    assignee: {
      name: "R",
      imageSource: require("../assets/local/avatars-small/avatar3.png"),
    },
    timestamp: new Date(),
    notification: "Richard made a comment",
    notificationIcon: <ChatIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-olive-700",
  },
  {
    name: "Jane Cooper",
    id: 525,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar2.png"),
    },
    timestamp: new Date(),
    notification: "James mentioned you in a comment",
    notificationIcon: <ChatIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-orange-700",
  },
  {
    name: "Savannah Nguyen",
    id: 31,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar4.png"),
    },
    timestamp: new Date(),
    notification: "Sarah assigned the conversation to you",
    notificationIcon: <UserIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-cyan-700",
  },
  {
    name: "Cameron Williamson",
    id: 515,
    assignee: {
      name: "T",
      imageSource: require("../assets/local/avatars-small/avatar5.png"),
    },
    timestamp: new Date(),
    notification: "Alyssa snoozed this conversation",
    notificationIcon: <SnoozedIcon stroke={tailwind.color("text-white")} />,
    notificationBgColor: "bg-yellow-800",
  },
];
