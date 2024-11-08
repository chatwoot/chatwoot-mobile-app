import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";

import { BottomSheetBackdrop, Icon } from "../common";

import { useRefsContext } from "@/context";
import { useToastStore } from "@/store";
import { CaretRight, ChevronLeft, InfoIcon, MacroIcon } from "@/svg-icons";
import { tailwind } from "@/theme";
import { GenericListType } from "@/types";
import { useHaptic, useScaleAnimation } from "@/utils";

const localMacrosList: GenericListType[] = [
  {
    title: "send-onboarding-email",
    hasChevron: false,
    actions: [
      {
        action_name: "Assign agent",
        action_params: ["self"],
      },
      {
        action_name: "Add label",
        action_params: ["wrong-chat"],
      },
      {
        action_name: "Send message",
        action_params: [
          "It looks like you are in the wrong place. This is the chat support center for chatwoot.com. Please reach out to the respective website owner for resolving your query.",
        ],
      },
    ],
  },
  {
    title: "close-when-no-response",
    hasChevron: false,
    actions: [],
  },
  {
    title: "sales-query",
    hasChevron: false,
    actions: [],
  },
  {
    title: "mark-as-wrong-chat",
    hasChevron: false,
    actions: [],
  },
  {
    title: "mark-as-spam",
    hasChevron: false,
    actions: [],
  },
  {
    title: "self-hosted-issue",
    hasChevron: false,
    actions: [],
  },
];

type MacroDetailsProps = {
  macro: GenericListType;
  onBack: () => void;
  onClose: () => void;
};

const MacroDetails = ({ macro, onBack, onClose }: MacroDetailsProps) => {
  const hapticSelection = useHaptic();
  const { handlers, animatedStyle } = useScaleAnimation();
  const setShowToast = useToastStore(state => state.setShowToast);
  const [isRunning, setMacroRunning] = useState(false);
  const onPress = useCallback(() => {
    setMacroRunning(true);
    hapticSelection?.();
    setTimeout(() => {
      setMacroRunning(false);
      setShowToast({
        showToast: true,
        toastMessage: "Macros executed successfully",
      });
      onClose();
    }, 1500);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View
      entering={FadeIn.duration(300).springify()}
      style={tailwind.style("flex-1")}
    >
      <View style={tailwind.style("flex-row items-center p-4")}>
        <Pressable onPress={onBack} style={tailwind.style("mr-1")}>
          <Icon icon={<ChevronLeft />} size={18} />
        </Pressable>
        <Animated.Text
          style={tailwind.style("flex-1 text-base")}
          numberOfLines={1}
        >
          {macro.title}
        </Animated.Text>
        <Animated.View style={animatedStyle}>
          <Pressable
            style={tailwind.style(
              "px-3 py-[7px] rounded-lg bg-gray-100 flex flex-row items-center justify-center",
            )}
            onPress={onPress}
            {...handlers}
          >
            {isRunning ? (
              <ActivityIndicator size="small" />
            ) : (
              <Animated.Text
                style={tailwind.style(
                  "text-sm font-inter-580-24 leading-[16px] tracking-[0.24px] pr-1 capitalize text-gray-950",
                )}
              >
                Run
              </Animated.Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
      {macro.actions && (
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style("px-4")}
        >
          {macro.actions.map((action, index) => (
            <View key={index} style={tailwind.style("relative pl-6 pb-4")}>
              {macro.actions && index !== macro.actions.length - 1 && (
                <View
                  style={tailwind.style(
                    "absolute top-[14px] bottom-0 left-[6px] w-[1px] bg-gray-200",
                  )}
                />
              )}
              <View
                style={tailwind.style(
                  "absolute left-0 top-[2px] w-3 h-3 rounded-full bg-white border-2 border-gray-300",
                )}
              />
              <Animated.Text style={tailwind.style("mb-1")}>
                {action.action_name}
              </Animated.Text>
              <Animated.Text style={tailwind.style("text-sm text-gray-900")}>
                {action.action_params.join(", ")}
              </Animated.Text>
            </View>
          ))}
        </BottomSheetScrollView>
      )}
    </Animated.View>
  );
};
type ListItemProps = {
  listItem: GenericListType;
  index: number;
  handleMacroPress: (macro: GenericListType) => void;
  isInsideBottomSheet: boolean;
  isLastItem: boolean;
};

const ListItem = (props: ListItemProps) => {
  const { listItem, index, handleMacroPress, isInsideBottomSheet, isLastItem } =
    props;

  const handleOnPress = useCallback(() => {
    handleMacroPress(listItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable
      onPress={handleOnPress}
      key={index}
      style={({ pressed }) => [
        tailwind.style(
          pressed ? "bg-gray-100" : "",
          index === 0 && !isInsideBottomSheet ? "rounded-t-[13px]" : "",
        ),
      ]}
    >
      <Animated.View style={tailwind.style("flex flex-row items-center pl-1")}>
        <Animated.View>
          <Icon icon={<MacroIcon />} size={20} />
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            "flex-1 ml-3 flex-row items-center justify-between py-[11px]",
            !isLastItem ? " border-b-[1px] border-b-blackA-A3" : "",
          )}
        >
          <Animated.View>
            <Animated.Text
              style={tailwind.style(
                " font-inter-420-20 leading-[22px] tracking-[0.16px] ",
              )}
            >
              {listItem.title}
            </Animated.Text>
          </Animated.View>
          <Animated.View
            style={tailwind.style("flex flex-row items-center pr-3")}
          >
            {listItem.hasChevron ? (
              <Icon icon={<CaretRight />} size={20} />
            ) : (
              <Icon icon={<InfoIcon />} size={22} />
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

type MacroStackProps = {
  macrosList: GenericListType[];
  isInsideBottomSheet?: boolean;
  handleMacroPress: (macro: GenericListType) => void;
};

const MacroStack = (props: MacroStackProps) => {
  const { macrosList, handleMacroPress, isInsideBottomSheet = false } = props;

  return (
    <Animated.View style={tailwind.style(isInsideBottomSheet ? "py-1" : "")}>
      {macrosList.map((listItem, index) => (
        <ListItem
          handleMacroPress={handleMacroPress}
          key={index}
          {...{ index, listItem, isInsideBottomSheet }}
          isLastItem={
            isInsideBottomSheet ? macrosList.length - 1 === index : false
          }
        />
      ))}
    </Animated.View>
  );
};

export const MacrosList = () => {
  const { bottom } = useSafeAreaInsets();

  const [selectedMacro, setSelectedMacro] = useState<GenericListType | null>(
    null,
  );

  const handleMacroPress = (macro: GenericListType) => {
    setSelectedMacro(macro);
    macrosListSheetRef.current?.present();
  };

  const handleBack = () => {
    setSelectedMacro(null);
  };

  const onClose = () => {
    setSelectedMacro(null);
    macrosListSheetRef.current?.dismiss({ overshootClamping: true });
  };

  const { macrosListSheetRef } = useRefsContext();

  const handleChange = () => {};

  return (
    <Animated.View>
      <BottomSheetModal
        ref={macrosListSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style(
          "overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]",
        )}
        handleStyle={tailwind.style("p-0 h-4 pt-[5px]")}
        style={tailwind.style("rounded-t-[26px] overflow-hidden")}
        enablePanDownToClose
        snapPoints={["90%"]}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onChange={handleChange}
      >
        <Animated.View style={tailwind.style("flex-1")}>
          {selectedMacro ? (
            <MacroDetails
              macro={selectedMacro}
              onBack={handleBack}
              onClose={onClose}
            />
          ) : (
            <Animated.View style={tailwind.style("flex-1")}>
              <View style={tailwind.style("px-4 pt-1 pb-4  items-center")}>
                <Animated.Text
                  style={tailwind.style(
                    "text-gray-700 font-inter-580-24 leading-[17px] tracking-[0.32px]",
                  )}
                >
                  Select macro
                </Animated.Text>
              </View>
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tailwind.style("px-3 pb-6")}
              >
                <MacroStack
                  handleMacroPress={handleMacroPress}
                  macrosList={localMacrosList}
                  isInsideBottomSheet
                />
              </BottomSheetScrollView>
            </Animated.View>
          )}
        </Animated.View>
        <View style={{ height: bottom }} />
      </BottomSheetModal>
    </Animated.View>
  );
};
