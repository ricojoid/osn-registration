CREATE TABLE Notifications (
    Id int NOT NULL IDENTITY,
    UserId int NOT NULL,
    Title nvarchar(200) NOT NULL,
    Message nvarchar(1000) NOT NULL,
    IsRead bit NOT NULL,
    CreatedAt datetime2 NOT NULL,
    CONSTRAINT PK_Notifications PRIMARY KEY (Id),
    CONSTRAINT FK_Notifications_Users_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
