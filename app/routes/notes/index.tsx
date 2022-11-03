import React from 'react';

interface NotesIndexProps {
	prop?: string;
}

const NotesIndex: React.FC<NotesIndexProps> = () => {
	return <div>Click on a note on the left side bar to see its content</div>;
};

export default NotesIndex;
