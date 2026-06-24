import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components-next';
import i18n from '@/i18n';
import type { CompanyNote } from '@/types/Company';
import { tailwind } from '@/theme';

type NoteDraftState =
  | { mode: 'new'; content: string }
  | { mode: 'edit'; noteId: number; content: string }
  | { mode: 'idle'; content: '' };

type CompanyNotesTabProps = {
  notes: CompanyNote[];
  isLoading?: boolean;
  onCreateNote: (content: string) => Promise<void>;
  onUpdateNote: (noteId: number, content: string) => Promise<void>;
  onDeleteNote: (noteId: number) => Promise<void>;
};

const formatTimestamp = (value?: number | string) => {
  if (!value) {
    return '';
  }

  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

export const CompanyNotesTab = ({
  notes,
  isLoading = false,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: CompanyNotesTabProps) => {
  const [draft, setDraft] = useState<NoteDraftState>({ mode: 'idle', content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = draft.mode !== 'idle';

  const resetDraft = () => setDraft({ mode: 'idle', content: '' });

  const saveDraft = async () => {
    const content = draft.content.trim();
    if (!content) {
      return;
    }

    setIsSaving(true);
    try {
      if (draft.mode === 'edit') {
        await onUpdateNote(draft.noteId, content);
      } else {
        await onCreateNote(content);
      }
      resetDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async (noteId: number) => {
    await onDeleteNote(noteId);
    if (draft.mode === 'edit' && draft.noteId === noteId) {
      resetDraft();
    }
  };

  return (
    <Animated.View style={tailwind.style('px-4 pt-4')}>
      {isEditing ? (
        <Animated.View style={tailwind.style('rounded-[13px] bg-gray-50 p-3')}>
          <TextInput
            multiline
            value={draft.content}
            onChangeText={content =>
              setDraft(currentDraft =>
                currentDraft.mode === 'idle'
                  ? { mode: 'new', content }
                  : { ...currentDraft, content },
              )
            }
            placeholder={i18n.t('COMPANIES.NOTES_PLACEHOLDER')}
            placeholderTextColor={tailwind.color('text-gray-700')}
            style={tailwind.style(
              'min-h-[96px] text-base font-inter-normal-20 leading-[22px] text-gray-950',
            )}
            textAlignVertical="top"
          />
          <View style={tailwind.style('flex-row gap-3 pt-3')}>
            <View style={tailwind.style('flex-1')}>
              <Button
                text={i18n.t('COMPANIES.CANCEL')}
                variant="secondary"
                handlePress={resetDraft}
              />
            </View>
            <View style={tailwind.style('flex-1')}>
              <Button text={i18n.t('COMPANIES.SAVE')} handlePress={saveDraft} disabled={isSaving} />
            </View>
          </View>
        </Animated.View>
      ) : (
        <Button
          text={i18n.t('COMPANIES.ADD_NOTE')}
          handlePress={() => setDraft({ mode: 'new', content: '' })}
        />
      )}

      <Animated.View style={tailwind.style('pt-4 gap-3')}>
        {isLoading ? (
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-6',
            )}>
            {i18n.t('COMPANIES.LOADING_NOTES')}
          </Animated.Text>
        ) : null}
        {!isLoading && notes.length === 0 ? (
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-6',
            )}>
            {i18n.t('COMPANIES.NO_NOTES')}
          </Animated.Text>
        ) : null}
        {notes.map(note => (
          <Animated.View key={note.id} style={tailwind.style('rounded-[13px] bg-gray-50 p-3')}>
            {note.contact?.name ? (
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style('pb-2 text-sm font-inter-medium-24 text-gray-700')}>
                {note.contact.name}
              </Animated.Text>
            ) : null}
            <Animated.Text
              style={tailwind.style('text-base font-inter-normal-20 leading-[22px] text-gray-950')}>
              {note.content}
            </Animated.Text>
            <View style={tailwind.style('flex-row items-center justify-between pt-3')}>
              <Animated.Text
                style={tailwind.style('text-sm font-inter-normal-20 leading-[18px] text-gray-900')}>
                {formatTimestamp(note.updatedAt || note.createdAt)}
              </Animated.Text>
              <View style={tailwind.style('flex-row gap-4')}>
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    setDraft({ mode: 'edit', noteId: note.id, content: note.content })
                  }>
                  <Animated.Text
                    style={tailwind.style(
                      'text-sm font-inter-medium-24 leading-[18px] text-blue-800',
                    )}>
                    {i18n.t('COMPANIES.EDIT')}
                  </Animated.Text>
                </Pressable>
                <Pressable hitSlop={8} onPress={() => deleteNote(note.id)}>
                  <Animated.Text
                    style={tailwind.style(
                      'text-sm font-inter-medium-24 leading-[18px] text-ruby-800',
                    )}>
                    {i18n.t('COMPANIES.DELETE')}
                  </Animated.Text>
                </Pressable>
              </View>
            </View>
            {note.user?.name ? (
              <Animated.Text
                style={tailwind.style(
                  'pt-2 text-sm font-inter-normal-20 leading-[18px] text-gray-700',
                )}>
                {note.user.name}
              </Animated.Text>
            ) : null}
          </Animated.View>
        ))}
      </Animated.View>
    </Animated.View>
  );
};
