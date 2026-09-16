from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        # Always return the currently logged-in user based on the JWT token
        return self.request.user

    def patch(self, request, *args, **kwargs):
        mode = request.data.get('mode')
        if mode not in ('TRAVELING', 'HOSTING'):
            return Response({'detail': 'Mode must be TRAVELING or HOSTING.'}, status=status.HTTP_400_BAD_REQUEST)
        if mode == 'HOSTING' and request.user.role != 'HOST':
            return Response({'detail': 'Only host accounts can enter hosting mode.'}, status=status.HTTP_403_FORBIDDEN)
        request.user.mode = mode
        request.user.save(update_fields=['mode'])
        return Response(self.get_serializer(request.user).data)


class ModeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def post(self, request):
        mode = request.data.get('mode')
        if mode not in ('TRAVELING', 'HOSTING'):
            return Response({'detail': 'Mode must be TRAVELING or HOSTING.'}, status=status.HTTP_400_BAD_REQUEST)
        if mode == 'HOSTING' and request.user.role != 'HOST':
            return Response({'detail': 'Only host accounts can enter hosting mode.'}, status=status.HTTP_403_FORBIDDEN)
        request.user.mode = mode
        request.user.save(update_fields=['mode'])
        return Response(UserSerializer(request.user).data)