import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components-next';
import { useAppDispatch } from '@/hooks';
import { contactActions } from '@/store/contact/contactActions';
import type { ContactNote } from '@/store/contact/contactTypes';
import { tailwind } from '@/theme';

type NoteDraftState =
  | { mode: 'new'; content: string }
  | { mode: 'edit'; noteId: number; content: string }
  | { mode: 'idle'; content: '' };

type ContactNotesTabProps = {
  contactId: number;
};

const formatTimestamp = (value?: number | string) => {
  if (!value) {
    return '';
  }

  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
};

export const ContactNotesTab = ({ contactId }: ContactNotesTabProps) => {
  const dispatch = useAppDispatch();
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [draft, setDraft] = useState<NoteDraftState>({ mode: 'idle', content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(contactActions.getContactNotes({ contactId })).unwrap();
      setNotes(response || []);
    } finally {
      setIsLoading(false);
    }
  }, [contactId, dispatch]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const resetDraft = () => {
    setDraft({ mode: 'idle', content: '' });
  };

  const saveDraft = async () => {
    const content = draft.content.trim();
    if (!content) {
      return;
    }

    setIsSaving(true);
    try {
      if (draft.mode === 'edit') {
        const note = await dispatch(
          contactActions.updateContactNote({ contactId, noteId: draft.noteId, content }),
        ).unwrap();
        setNotes(currentNotes =>
          currentNotes.map(currentNote => (currentNote.id === note.id ? note : currentNote)),
        );
      } else {
        const note = await dispatch(
          contactActions.createContactNote({ contactId, content }),
        ).unwrap();
        setNotes(currentNotes => [note, ...currentNotes]);
      }
      resetDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async (noteId: number) => {
    await dispatch(contactActions.deleteContactNote({ contactId, noteId })).unwrap();
    setNotes(currentNotes => currentNotes.filter(note => note.id !== noteId));
    if (draft.mode === 'edit' && draft.noteId === noteId) {
      resetDraft();
    }
  };

  const isEditing = draft.mode !== 'idle';

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
            placeholder="Add a private note"
            style={tailwind.style(
              'min-h-[96px] text-base font-inter-normal-20 leading-[22px] text-gray-950',
            )}
            textAlignVertical="top"
          />
          <Animated.View style={tailwind.style('flex-row gap-3 pt-3')}>
            <Animated.View style={tailwind.style('flex-1')}>
              <Button text="Cancel" variant="secondary" handlePress={resetDraft} />
            </Animated.View>
            <Animated.View style={tailwind.style('flex-1')}>
              <Button text="Save" handlePress={saveDraft} disabled={isSaving} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      ) : (
        <Button text="Add note" handlePress={() => setDraft({ mode: 'new', content: '' })} />
      )}

      <Animated.View style={tailwind.style('pt-4 gap-3')}>
        {isLoading ? (
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-6',
            )}>
            Loading notes
          </Animated.Text>
        ) : null}
        {!isLoading && notes.length === 0 ? (
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-normal-20 leading-[22px] text-gray-900 text-center py-6',
            )}>
            No notes yet
          </Animated.Text>
        ) : null}
        {notes.map(note => (
          <Animated.View key={note.id} style={tailwind.style('rounded-[13px] bg-gray-50 p-3')}>
            <Animated.Text
              style={tailwind.style('text-base font-inter-normal-20 leading-[22px] text-gray-950')}>
              {note.content}
            </Animated.Text>
            <Animated.View style={tailwind.style('flex-row items-center justify-between pt-3')}>
              <Animated.Text
                style={tailwind.style('text-sm font-inter-normal-20 leading-[18px] text-gray-900')}>
                {formatTimestamp(note.updatedAt || note.createdAt)}
              </Animated.Text>
              <Animated.View style={tailwind.style('flex-row gap-4')}>
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    setDraft({ mode: 'edit', noteId: note.id, content: note.content })
                  }>
                  <Animated.Text
                    style={tailwind.style(
                      'text-sm font-inter-medium-24 leading-[18px] text-blue-800',
                    )}>
                    Edit
                  </Animated.Text>
                </Pressable>
                <Pressable hitSlop={8} onPress={() => deleteNote(note.id)}>
                  <Animated.Text
                    style={tailwind.style(
                      'text-sm font-inter-medium-24 leading-[18px] text-ruby-800',
                    )}>
                    Delete
                  </Animated.Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        ))}
      </Animated.View>
    </Animated.View>
  );
};
