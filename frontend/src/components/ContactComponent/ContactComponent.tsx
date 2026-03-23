import { FC, ChangeEvent } from 'react';
import { Textarea, Box } from '@chakra-ui/react';

type TextareaProps = {
  header: string;
  subHeaderText: string;
  contestantName: string;
  setContestantName: (value: string) => void;
}

const CommentComponent: FC<TextareaProps> = ({ subHeaderText, contestantName, setContestantName }) => {

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContestantName(event.target.value);
  };

  return (
    <Box position="relative">
      <Textarea
        rows={1}
        onChange={handleChange}
        value={contestantName}
        placeholder={subHeaderText}
      />
    </Box>
  )
}

export default CommentComponent;