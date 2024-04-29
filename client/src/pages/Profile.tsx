import { Button } from '../components/Button';
import { useUser } from '../components/useUser';
import { useNavigate, useParams } from 'react-router-dom';

export function Profile() {
  const { handleSignOut } = useUser();
  const { userId: userProfileId } = useParams();
  const nav = useNavigate();

  // Create endpoint in server to get user details from userID
  // Create function in data.ts to call enpoint
  // Call function in useEffect async function
  // Display data

  return (
    <div className="row">
      <h1>{userProfileId}</h1>
      <Button
        text="Sign Out"
        onClick={() => {
          handleSignOut();
          nav('/');
        }}
      />
    </div>
  );
}
