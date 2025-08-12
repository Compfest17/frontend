import { getPasswordStrength, validatePassword } from '../lib/authUtils';

export default function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);
  const errors = validatePassword(password);
  
  const strengthColors = {
    0: 'bg-gray-200',
    1: 'bg-red-400',
    2: 'bg-yellow-400',
    3: 'bg-blue-400',
    4: 'bg-green-400'
  };
  
  const strengthLabels = {
    0: '',
    1: 'Lemah',
    2: 'Cukup',
    3: 'Kuat',
    4: 'Sangat Kuat'
  };
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-sm ${
              strength >= level ? strengthColors[strength] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {strength > 0 && (
        <p className={`text-sm ${
          strength <= 2 ? 'text-red-600' : 
          strength === 3 ? 'text-blue-600' : 'text-green-600'
        }`}>
          {strengthLabels[strength]}
        </p>
      )}
      
      {errors.length > 0 && (
        <div className="mt-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
