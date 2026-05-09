import { observer } from 'mobx-react-lite';
import { playerStore } from '../model/player-store';

export const VMError = observer(() => {
  const { error } = playerStore;
  if (!error) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
      }}>
      {error.message}
    </div>
  );
});
