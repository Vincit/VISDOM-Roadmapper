import { UserInfo } from '../redux/user/types';
import { RoleType } from '../../../shared/types/customTypes';

export const UserInfoCard = ({ userInfo }: { userInfo: UserInfo }) => (
  <div>
    <div className="listHeader">
      <h2>Account</h2>
    </div>
    <div>
      {userInfo.email} ({userInfo.emailVerified ? 'verified' : 'not verified'})
    </div>
    {userInfo.roles.map((roadmapRole) => (
      <div key={roadmapRole.roadmapId}>
        {`Roadmap ${roadmapRole.roadmapId}: ${RoleType[roadmapRole.type]}`}
      </div>
    ))}
    <div>{userInfo.id}</div>
  </div>
);
